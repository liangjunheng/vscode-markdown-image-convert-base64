import * as vscode from 'vscode';

export function insertCodeBlock() {
    const editor = vscode.window.activeTextEditor!;
    if (editor.selection.isEmpty) {
        const line = editor.document.lineAt(editor.selection.active.line);
        editor.selection = new vscode.Selection(line.range.start, line.range.end);
    }
    return editor.insertSnippet(new vscode.SnippetString('\n```${1:language}\n$TM_SELECTED_TEXT$0\n```'));
}