import * as vscode from 'vscode';

export function insertMermaid() {
    const editor = vscode.window.activeTextEditor!;
    if (editor.selection.isEmpty) {
        const line = editor.document.lineAt(editor.selection.active.line);
        editor.selection = new vscode.Selection(line.range.start, line.range.end);
    }
    return editor.insertSnippet(new vscode.SnippetString('\n```mermaid$0\n$TM_SELECTED_TEXT\n```'));
}