import * as vscode from 'vscode';
import { isExternalUrl, isExternalImage } from '../../orther/parse_link_utils';

export function insertImageBlock() {
    const editor = vscode.window.activeTextEditor!;
    if (editor.selection.isEmpty) {
        const line = editor.document.lineAt(editor.selection.active.line);
        editor.selection = new  vscode.Selection(line.range.start, line.range.end);
    }
    const selectedText = editor.document.getText(editor.selection);
    if(isExternalUrl(selectedText) || isExternalImage(selectedText)) {
        return editor.insertSnippet(new vscode.SnippetString('[${1:alt text}]($TM_SELECTED_TEXT)'));
    } else {
        return editor.insertSnippet(new vscode.SnippetString('[$TM_SELECTED_TEXT](${2:image.png})'));
    }
}