/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { getMarkdownImageFromLine } from './checkImageLine';
import { imageToBase64 } from './ImageToBase64Converter';
import * as config_manager from './config_manager';

/**
 * Provides code actions for converting base64 code to ![][image-id] and append base64 code to text's last line.
 */
export class MDBase64er implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.CodeAction[] | undefined> {
		const imageAddrImageStyleToBase64ImageStyleJob = this.imageAddrImageStyleToBase64ImageStyle(document, range);
		const base64ContentToBase64ImageStyleJob = this.base64ContentToBase64ImageStyle(document, range);
		
		const codeActions: vscode.CodeAction[] = [];
		const imageAddrImageStyleToBase64ImageStyle = await imageAddrImageStyleToBase64ImageStyleJob;
		if (imageAddrImageStyleToBase64ImageStyle) {
			codeActions.unshift(imageAddrImageStyleToBase64ImageStyle);
		}
		const base64ContentToBase64ImageStyle = await base64ContentToBase64ImageStyleJob;
		if (base64ContentToBase64ImageStyle) {
			codeActions.unshift(base64ContentToBase64ImageStyle);
		}
		return codeActions;
	}

	/**
	 * input: ![](./image.png)
	 * output: ![](data:image/*;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAfAToDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2ClopK3OQWiiigApKKWmMSlopKACilooAKSlpKQC0UUlABS0UlABS0UlABRRSUDFpKWkoAWikpaAEpaKSgBaKSjFAC0lLSUAFFLSUwClopKAFooooAKSiloASjPvS0mPagBaWkopEi0lLSUALRRRTGFJSikoAWiikoAWijrSdqQC0lFLQAUlFLQAlLSUtACUUdKKBiUtJS0AJRS0lABS0lLQAUnelpKAFpKWjtQAUlFFMApaSigBaSlpKAFooooAKT8KUUmfagD//2Q==)
	 */
	async imageAddrImageStyleToBase64ImageStyle(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.CodeAction | undefined> {
		const start = range.start;
		const lineContent = document.lineAt(start.line).text;
		if (lineContent === undefined || lineContent === '') {
			return undefined;
		}
		const localImage = getMarkdownImageFromLine(lineContent);
		console.log(`localImage, content: ${lineContent} --> (${localImage?.alt}, ${localImage?.url})`)
		if (localImage?.url === undefined) {
			return undefined;
		}

		const base64 = await imageToBase64(localImage?.url, config_manager.getModifyImageWidth())
		if (base64 === undefined) {
			return undefined;
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
		return fix;
	}

	/**
	 * input: data:image/*;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAfAToDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2ClopK3OQWiiigApKKWmMSlopKACilooAKSlpKQC0UUlABS0UlABS0UlABRRSUDFpKWkoAWikpaAEpaKSgBaKSjFAC0lLSUAFFLSUwClopKAFooooAKSiloASjPvS0mPagBaWkopEi0lLSUALRRRTGFJSikoAWiikoAWijrSdqQC0lFLQAUlFLQAlLSUtACUUdKKBiUtJS0AJRS0lABS0lLQAUnelpKAFpKWjtQAUlFFMApaSigBaSlpKAFooooAKT8KUUmfagD//2Q==
	 * output: ![](data:image/*;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAfAToDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2ClopK3OQWiiigApKKWmMSlopKACilooAKSlpKQC0UUlABS0UlABS0UlABRRSUDFpKWkoAWikpaAEpaKSgBaKSjFAC0lLSUAFFLSUwClopKAFooooAKSiloASjPvS0mPagBaWkopEi0lLSUALRRRTGFJSikoAWiikoAWijrSdqQC0lFLQAUlFLQAlLSUtACUUdKKBiUtJS0AJRS0lABS0lLQAUnelpKAFpKWjtQAUlFFMApaSigBaSlpKAFooooAKT8KUUmfagD//2Q==)
	 */
	async base64ContentToBase64ImageStyle(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.CodeAction | undefined> {
		const start = range.start;
		const content = document.lineAt(start.line).text;
		const isAtStartOfSmiley = content.indexOf('data:image/*;base64,') > -1 && content.indexOf('[') != 0;
		if (!isAtStartOfSmiley) {
			return
		}

		const fix = new vscode.CodeAction(`Replace IMG ID`, vscode.CodeActionKind.QuickFix);
		fix.edit = new vscode.WorkspaceEdit();
		console.log("start ", range.start);
		console.log("end ", range.end);
		const time_id = Date.now().toString();
		console.log(time_id);
		const image_id = `![](${content})`;
		fix.edit.replace(document.uri, new vscode.Range(new vscode.Position(range.start.line, 0), new vscode.Position(range.start.line, document.lineAt(range.start.line).text.length)), image_id);
		fix.isPreferred = true;
		return fix;
	}
}
