import * as vscode from 'vscode';

export function insertTableBlock() {
    const editor = vscode.window.activeTextEditor!;
    if (editor.selection.isEmpty) {
        const line = editor.document.lineAt(editor.selection.active.line);
        editor.selection = new vscode.Selection(line.range.start, line.range.end);
    }
    return editor.insertSnippet(new vscode.SnippetString(
        [
            "| ${1:Column1} | ${2:Column2} | ${3:Column3} |",
            "| ------- | ------- | ------- |",
            "| ${4:Item1}   | ${5:Item1}   | ${6:Item1}   |",
            "${0}\n$TM_SELECTED_TEXT"
        ].join('\n'))
    );
}