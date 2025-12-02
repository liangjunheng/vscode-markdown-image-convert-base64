import { commands, env, ExtensionContext, Position, Range, Selection, SnippetString, TextDocument, TextEditor, window, workspace, WorkspaceEdit } from 'vscode';

/**
 * List candidate markers enum
 */
export enum ListMarker {
    EMPTY = "",
    DASH = "- ",
    STAR = "* ",
    PLUS = "+ ",
    NUM = "1. ",
    TASK = "- [ ] ",
    NUM_CLOSING_PARETHESES = "1) "
}

export function toggleList(type: ListMarker) {
    const editor = window.activeTextEditor!;
    const doc = editor.document;
    let batchEdit = new WorkspaceEdit();

    for (const selection of editor.selections) {
        if (selection.isEmpty) {
            toggleListSingleLine(doc, selection.active.line, batchEdit, type);
        } else {
            for (let i = selection.start.line; i <= selection.end.line; i++) {
                toggleListSingleLine(doc, i, batchEdit, type);
            }
        }
    }

    return workspace.applyEdit(batchEdit).then(() => fixMarker(editor));
}

function toggleListSingleLine(doc: TextDocument, line: number, wsEdit: WorkspaceEdit, type: ListMarker) {
    const lineText = doc.lineAt(line).text;
    const indentation = lineText.trim().length === 0 ? lineText.length : lineText.indexOf(lineText.trim());
    const lineTextContent = lineText.slice(indentation);
    const currentMarker = getCurrentListStart(lineTextContent);
    console.log(`currentMarker: ${currentMarker}`)
    // const nextMarker = getNextListStart(currentMarker);

    // 1. delete current list marker
    wsEdit.delete(doc.uri, new Range(line, indentation, line, getMarkerEndCharacter(currentMarker, lineText)));

    // 2. insert next list marker
    if (type !== ListMarker.EMPTY && currentMarker !== type) {
        wsEdit.insert(doc.uri, new Position(line, indentation), type);
    }
}

function getListMarker(listMarker: string): ListMarker {
    if ("- " === listMarker) {
        return ListMarker.DASH;
    } else if ("* " === listMarker) {
        return ListMarker.STAR;
    } else if ("+ " === listMarker) {
        return ListMarker.PLUS;
    } else if ("1. " === listMarker) {
        return ListMarker.NUM;
    } else if ("1) " === listMarker) {
        return ListMarker.NUM_CLOSING_PARETHESES;
    } else if (/(^-\s\[[ xX]?\]\s)/.test(listMarker)) {
        return ListMarker.TASK;
    } else {
        return ListMarker.EMPTY;
    }
}

const listMarkerSimpleListStart = [ListMarker.DASH, ListMarker.STAR, ListMarker.PLUS]
const listMarkerDefaultMarkerArray = [ListMarker.DASH, ListMarker.STAR, ListMarker.PLUS, ListMarker.NUM, ListMarker.NUM_CLOSING_PARETHESES, ListMarker.TASK]
const listMarkerNumRegex = /^\d+\. /;
const listMarkerNumClosingParethesesRegex = /^\d+\) /;
const listMarkTaskRegex = /(^-\s\[[ xX]?\]\s)/;

function getMarkerEndCharacter(currentMarker: ListMarker, lineText: string): number {
    const indentation = lineText.trim().length === 0 ? lineText.length : lineText.indexOf(lineText.trim());
    const lineTextContent = lineText.slice(indentation);

    let endCharacter = indentation;
    if (listMarkerSimpleListStart.includes(currentMarker)) {
        // `- `, `* `, `+ `
        endCharacter += 2;
    } else if (listMarkerNumRegex.test(lineTextContent)) {
        // number
        const lenOfDigits = /^(\d+)\./.exec(lineText.trim())![1].length;
        endCharacter += lenOfDigits + 2;
    } else if (listMarkerNumClosingParethesesRegex.test(lineTextContent)) {
        // number with )
        const lenOfDigits = /^(\d+)\)/.exec(lineText.trim())![1].length;
        endCharacter += lenOfDigits + 2;
    } else if (listMarkTaskRegex.test(lineTextContent)) {
        const lenOfDigits = listMarkTaskRegex.exec(lineText.trim())![1].length;
        endCharacter = lenOfDigits;
    }
    return endCharacter;
}

/**
 * get list start marker
 */
function getCurrentListStart(lineTextContent: string): ListMarker {
    if (listMarkTaskRegex.test(lineTextContent)) {
        return ListMarker.TASK;
    } else if (lineTextContent.startsWith(ListMarker.DASH)) {
        return ListMarker.DASH;
    } else if (lineTextContent.startsWith(ListMarker.STAR)) {
        return ListMarker.STAR;
    } else if (lineTextContent.startsWith(ListMarker.PLUS)) {
        return ListMarker.PLUS;
    } else if (listMarkerNumRegex.test(lineTextContent)) {
        return ListMarker.NUM;
    } else if (listMarkerNumClosingParethesesRegex.test(lineTextContent)) {
        return ListMarker.NUM_CLOSING_PARETHESES;
    } else {
        return ListMarker.EMPTY;
    }
}

/**
 * get next candidate marker from configArray
 */
function getNextListStart(current: ListMarker): ListMarker {
    const configArray = getCandidateMarkers();
    let next = configArray[0];
    const index = configArray.indexOf(current);
    if (index >= 0 && index < configArray.length - 1)
        next = configArray[index + 1];
    return next;
}

/**
 * get candidate markers array from configuration 
 */
function getCandidateMarkers(): ListMarker[] {
    // read configArray from configuration and append space
    let configArray = workspace.getConfiguration('extension.list.toggle').get<string[]>('candidate-markers');
    if (!(configArray instanceof Array))
        return listMarkerDefaultMarkerArray;

    // append a space after trim, markers must end with a space and remove unknown markers
    let listMarkerArray = configArray.map((e) => getListMarker(e + " ")).filter((e) => listMarkerDefaultMarkerArray.includes(e));
    // push empty in the configArray for init status without list marker
    listMarkerArray.push(ListMarker.EMPTY);

    return listMarkerArray;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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