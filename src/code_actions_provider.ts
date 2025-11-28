/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { getMarkdownImageFromLine } from './utils/line_content_checker';
import { imageToBase64 } from './utils/image_to_base64_util';
import * as config_manager from './config_manager';

/**
 * Provides code actions for converting base64 code to ![][image-id] and append base64 code to text's last line.
 */
export class CodeActionsProvider implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix,
	];

	constructor(context: vscode.ExtensionContext) {
		console.log(`CodeActionsProvider, constructor start`);
		// this.initTextSelectionListener(context)
	}

	// 切换行时，自动触发quickFix
	initTextSelectionListener(context: vscode.ExtensionContext) {
		var lastLine = -1;
		const disposable = vscode.window.onDidChangeTextEditorSelection(async (event) => {
			const editor = event.textEditor;
			if (!editor) {
				lastLine = -1;
				return;
			}
			const currentLine = editor.selection.active.line;
			if (lastLine === currentLine) {
				return;
			}
			lastLine = currentLine;
			await vscode.commands.executeCommand('editor.action.quickFix');
		});
		context.subscriptions.push(disposable);
	}

	// 返回Quick Fix
	public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.CodeAction[] | undefined> {
		const codeActions: vscode.CodeAction[] = [];
		const start = range.start;
		const lineContent = document.lineAt(start.line).text;
		console.log(`provideCodeActions, content: ${lineContent}`)

		const insertImageBlockTipsCodeAction = await this.insertImageBlockTipsCodeAction(document, range, lineContent)
		if(insertImageBlockTipsCodeAction) {
			codeActions.push(insertImageBlockTipsCodeAction)
		}
		const insertLinkBlockTipsCodeAction = await this.insertLinkBlockTipsCodeAction(document, range, lineContent)
		if(insertLinkBlockTipsCodeAction) {
			codeActions.push(insertLinkBlockTipsCodeAction)
		}
		const insertTableTipsCodeAction = await this.insertTableTipsCodeAction(document, range, lineContent)
		if(insertTableTipsCodeAction) {
			codeActions.push(insertTableTipsCodeAction)
		}
		const insertTaskTipsCodeAction = await this.insertTaskTipsCodeAction(document, range, lineContent)
		if (insertTaskTipsCodeAction) {
			codeActions.push(insertTaskTipsCodeAction)
		}
		const insertMermaidTipsCodeAction = await this.insertMermaidTipsCodeAction(document, range, lineContent)
		if (insertMermaidTipsCodeAction) {
			codeActions.push(insertMermaidTipsCodeAction)
		}

		const imageAddrImageStyleToBase64ImageStyleJob = this.imageAddrImageStyleToBase64ImageStyle(document, range, lineContent);
		const base64ContentToBase64ImageStyleJob = this.base64ContentToBase64ImageStyle(document, range, lineContent);
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

	async insertLinkBlockTipsCodeAction(document: vscode.TextDocument, range: vscode.Range, lineContent: string): Promise<vscode.CodeAction | undefined> {
		if (lineContent.trim() !== '' && lineContent !== 'link') {
			return undefined
		}
		const codeAction = new vscode.CodeAction(`Insert Link Block`, vscode.CodeActionKind.QuickFix);
		codeAction.edit = new vscode.WorkspaceEdit();
		codeAction.edit.replace(document.uri, new vscode.Range(new vscode.Position(range.start.line, 0), new vscode.Position(range.start.line, document.lineAt(range.start.line).text.length)), '');
		codeAction.command = {
			title: '',
			command: 'editor.action.insertSnippet',
			arguments: [{
				snippet: "[${1:title}](${2:https://example.com})",
			}],
		};
		return codeAction;
	}


	async insertImageBlockTipsCodeAction(document: vscode.TextDocument, range: vscode.Range, lineContent: string): Promise<vscode.CodeAction | undefined> {
		if (lineContent.trim() !== '' && lineContent !== 'image') {
			return undefined
		}
		const codeAction = new vscode.CodeAction(`Insert Image Block`, vscode.CodeActionKind.QuickFix);
		codeAction.edit = new vscode.WorkspaceEdit();
		codeAction.edit.replace(document.uri, new vscode.Range(new vscode.Position(range.start.line, 0), new vscode.Position(range.start.line, document.lineAt(range.start.line).text.length)), '');
		codeAction.command = {
			title: '',
			command: 'editor.action.insertSnippet',
			arguments: [{
				snippet: "![${1:title}](${2:image.png})",
			}],
		};
		return codeAction;
	}

	async insertTableTipsCodeAction(document: vscode.TextDocument, range: vscode.Range, lineContent: string): Promise<vscode.CodeAction | undefined> {
		if(lineContent.trim() !== '' && lineContent !== 'table') {
			return undefined
		}
		const codeAction = new vscode.CodeAction(`Insert Table`, vscode.CodeActionKind.QuickFix);
		codeAction.edit = new vscode.WorkspaceEdit();
		codeAction.edit.replace(document.uri, new vscode.Range(new vscode.Position(range.start.line, 0), new vscode.Position(range.start.line, document.lineAt(range.start.line).text.length)), '');
		codeAction.command = {
			title: '',
			command: 'editor.action.insertSnippet',
			arguments: [{
				snippet: [
					"| ${1:Column1} | ${2:Column2} | ${3:Column3} |",
					"| ------- | ------- | ------- |",
					"| ${4:Item1}   | ${5:Item1}   | ${6:Item1}   |",
					"${0}"
				].join('\n'),
			}],
		};
		return codeAction;
	}

	async insertTaskTipsCodeAction(document: vscode.TextDocument, range: vscode.Range, lineContent: string): Promise<vscode.CodeAction | undefined> {
		if(lineContent.trim() !== '' && lineContent !== 'task') {
			return undefined
		}
		const codeAction = new vscode.CodeAction(`Insert Task`, vscode.CodeActionKind.QuickFix);
		codeAction.edit = new vscode.WorkspaceEdit();
		codeAction.edit.replace(document.uri, new vscode.Range(new vscode.Position(range.start.line, 0), new vscode.Position(range.start.line, document.lineAt(range.start.line).text.length)), '');
		codeAction.command = {
		title: '',
		command: 'editor.action.insertSnippet',
		arguments: [{
			snippet: "- [${1| ,x|}] ${2:text}",
		}],
		};
		return codeAction
	}

	async insertMermaidTipsCodeAction(document: vscode.TextDocument, range: vscode.Range, lineContent: string): Promise<vscode.CodeAction | undefined> {
		if(lineContent.trim() !== '' && lineContent !== 'mermaid') {
			return undefined
		}
		const codeAction = new vscode.CodeAction(`Insert Mermaid`, vscode.CodeActionKind.QuickFix);
		codeAction.edit = new vscode.WorkspaceEdit();
		codeAction.edit.replace(document.uri, new vscode.Range(new vscode.Position(range.start.line, 0), new vscode.Position(range.start.line, document.lineAt(range.start.line).text.length)), '');
		codeAction.command = {
			title: '',
			command: 'editor.action.insertSnippet',
			arguments: [{
				snippet: "```mermaid\n${1}\n```",
			}],
		};
		return codeAction
	}

	/**
	 * input: ![](./image.png)
	 * output: ![](data:image/*;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAfAToDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2ClopK3OQWiiigApKKWmMSlopKACilooAKSlpKQC0UUlABS0UlABS0UlABRRSUDFpKWkoAWikpaAEpaKSgBaKSjFAC0lLSUAFFLSUwClopKAFooooAKSiloASjPvS0mPagBaWkopEi0lLSUALRRRTGFJSikoAWiikoAWijrSdqQC0lFLQAUlFLQAlLSUtACUUdKKBiUtJS0AJRS0lABS0lLQAUnelpKAFpKWjtQAUlFFMApaSigBaSlpKAFooooAKT8KUUmfagD//2Q==)
	 */
	async imageAddrImageStyleToBase64ImageStyle(document: vscode.TextDocument, range: vscode.Range, lineContent: string): Promise<vscode.CodeAction | undefined> {
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

		const fix = new vscode.CodeAction(`Convert Image Path To Base64`, vscode.CodeActionKind.QuickFix);
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
	async base64ContentToBase64ImageStyle(document: vscode.TextDocument, range: vscode.Range, lineContent: string): Promise<vscode.CodeAction | undefined> {
		const isAtStartOfSmiley = lineContent.indexOf('data:image/*;base64,') > -1 && lineContent.indexOf('[') != 0;
		if (!isAtStartOfSmiley) {
			return
		}

		const fix = new vscode.CodeAction(`Convert Image Block`, vscode.CodeActionKind.QuickFix);
		fix.edit = new vscode.WorkspaceEdit();
		console.log("start ", range.start);
		console.log("end ", range.end);
		const time_id = Date.now().toString();
		console.log(time_id);
		const image_id = `![](${lineContent})`;
		fix.edit.replace(document.uri, new vscode.Range(new vscode.Position(range.start.line, 0), new vscode.Position(range.start.line, document.lineAt(range.start.line).text.length)), image_id);
		fix.isPreferred = true;
		return fix;
	}
}
