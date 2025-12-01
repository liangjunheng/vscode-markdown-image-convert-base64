import { Range, TextEditor, workspace } from 'vscode';

/**
 * Returns the line index of the next ordered list item starting from the specified line.
 *
 * @param line
 * Defaults to the beginning of the current primary selection (`editor.selection.start.line`)
 * in order to find the first marker following either the cursor or the entire selected range.
 */
function findNextMarkerLineNumber(editor: TextEditor, line = editor.selection.start.line): number {
    while (line < editor.document.lineCount) {
        const lineText = editor.document.lineAt(line).text;

        if (lineText.startsWith('#')) {
            // Don't go searching past any headings
            return -1;
        }

        if (/^\s*[0-9]+[.)] +/.exec(lineText) !== null) {
            return line;
        }
        line++;
    }
    return -1;
}

/**
 * Looks for the previous ordered list marker at the same indentation level
 * and returns the marker number that should follow it.
 * 
 * @param currentIndentation treat tabs as if they were replaced by spaces with a tab stop of 4 characters
 *
 * @returns the fixed marker number
 */
function lookUpwardForMarker(editor: TextEditor, line: number, currentIndentation: number): number {
    let prevLine = line;
    while (--prevLine >= 0) {
        const prevLineText = editor.document.lineAt(prevLine).text.replace(/\t/g, '    ');
        let matches;
        if ((matches = /^(\s*)(([0-9]+)[.)] +)/.exec(prevLineText)) !== null) {
            // The previous line has an ordered list marker
            const prevLeadingSpace: string = matches[1];
            const prevMarker = matches[3];
            if (currentIndentation < prevLeadingSpace.length) {
                // yet to find a sibling item
                continue;
            } else if (
                currentIndentation >= prevLeadingSpace.length
                && currentIndentation <= (prevLeadingSpace + prevMarker).length
            ) {
                // found a sibling item
                return Number(prevMarker) + 1;
            } else if (currentIndentation > (prevLeadingSpace + prevMarker).length) {
                // found a parent item
                return 1;
            } else {
                // not possible
            }
        } else if ((matches = /^(\s*)([-+*] +)/.exec(prevLineText)) !== null) {
            // The previous line has an unordered list marker
            const prevLeadingSpace: string = matches[1];
            if (currentIndentation >= prevLeadingSpace.length) {
                // stop finding
                break;
            }
        } else if ((matches = /^(\s*)\S/.exec(prevLineText)) !== null) {
            // The previous line doesn't have a list marker
            if (matches[1].length < 3) {
                // no enough indentation for a list item
                break;
            }
        }
    }
    return 1;
}

/**
 * Fix ordered list marker *iteratively* starting from current line
 */
export function fixMarker(editor: TextEditor, line?: number): Thenable<unknown> | void {
    if (!workspace.getConfiguration('markdown.extension.orderedList').get<boolean>('autoRenumber')) return;
    if (workspace.getConfiguration('markdown.extension.orderedList').get<string>('marker') == 'one') return;

    if (line === undefined) {
        line = findNextMarkerLineNumber(editor);
    }
    if (line < 0 || line >= editor.document.lineCount) {
        return;
    }

    let currentLineText = editor.document.lineAt(line).text;
    let matches;
    if ((matches = /^(\s*)([0-9]+)([.)])( +)/.exec(currentLineText)) !== null) { // ordered list
        let leadingSpace = matches[1];
        let marker = matches[2];
        let delimiter = matches[3];
        let trailingSpace = matches[4];
        let fixedMarker = lookUpwardForMarker(editor, line, leadingSpace.replace(/\t/g, '    ').length);
        let listIndent = marker.length + delimiter.length + trailingSpace.length;
        let fixedMarkerString = String(fixedMarker);

        return editor.edit(
            // fix the marker (current line)
            editBuilder => {
                if (marker === fixedMarkerString) {
                    return;
                }
                // Add enough trailing spaces so that the text is still aligned at the same indentation level as it was previously, but always keep at least one space
                fixedMarkerString += delimiter + " ".repeat(Math.max(1, listIndent - (fixedMarkerString + delimiter).length));

                editBuilder.replace(new Range(line!, leadingSpace.length, line!, leadingSpace.length + listIndent), fixedMarkerString);
            },
            { undoStopBefore: false, undoStopAfter: false }
        ).then(() => {
            let nextLine = line! + 1;
            while (editor.document.lineCount > nextLine) {
                const nextLineText = editor.document.lineAt(nextLine).text;
                if (/^\s*[0-9]+[.)] +/.test(nextLineText)) {
                    return fixMarker(editor, nextLine);
                } else if (
                    editor.document.lineAt(nextLine - 1).isEmptyOrWhitespace  // This line is a block
                    && !nextLineText.startsWith(" ".repeat(3))                // and doesn't have enough indentation
                    && !nextLineText.startsWith("\t")                         // so terminates the current list.
                ) {
                    return;
                } else {
                    nextLine++;
                }
            }
        });
    }
}

export function deactivate() { }
