import * as vscode from 'vscode';

export function getModifyImageWidth(): number {
    return vscode.workspace.getConfiguration('markdown-image-convert-base64').get('modifyImageWidth', 0);
}
