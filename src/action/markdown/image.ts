import * as vscode from 'vscode';

export function insertImageBlock() {
    const editor = vscode.window.activeTextEditor!;
    if (editor.selection.isEmpty) {
        const line = editor.document.lineAt(editor.selection.active.line);
        editor.selection = new  vscode.Selection(line.range.start, line.range.end);
    }
    return editor.insertSnippet(new  vscode.SnippetString('![${1:alt text}](${2:$TM_SELECTED_TEXT})'));
}