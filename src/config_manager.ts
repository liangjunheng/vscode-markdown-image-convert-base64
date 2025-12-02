import * as vscode from 'vscode';

export function getModifyImageWidth(): number {
    return vscode.workspace.getConfiguration('markdown-intellisense').get('modifyImageWidth', 0);
}

export function isEnableLineTools(): boolean {
    return vscode.workspace.getConfiguration('markdown-intellisense').get('enableLineTools', false);
}
