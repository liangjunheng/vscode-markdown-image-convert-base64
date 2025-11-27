/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { getMarkdownImageFromLine } from './checkImageLine';
import { imageToBase64 } from './ImageToBase64Converter';

/**
 * Provides code actions for converting base64 code to ![][image-id] and append base64 code to text's last line.
 */
export class MDBase64er implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.CodeAction[] | undefined> {
		const start = range.start;
		const content = document.lineAt(start.line).text;
		const localImage = getMarkdownImageFromLine(content);
		console.log(`localImage, content: ${content} --> (${localImage?.alt}, ${localImage?.url})`)
		if(localImage?.url === undefined) {
			return
		}

		const base64 = await imageToBase64(localImage?.url, 600)
		if(base64 === undefined) {
			return
		}

		const fix = new vscode.CodeAction(`Replace IMG ID`, vscode.CodeActionKind.QuickFix);
		fix.edit = new vscode.WorkspaceEdit();
		console.log("start ", range.start);
		console.log("end ", range.end);
		const time_id = Date.now().toString();
		console.log(time_id);
		const image_id = `![${localImage?.alt}](${base64})`;
		fix.edit.replace(document.uri, new vscode.Range(new vscode.Position(range.start.line, 0), new vscode.Position(range.start.line, document.lineAt(range.start.line).text.length)), image_id);
		fix.isPreferred = true;

		return [fix,];
	}


}
