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
		const lineContent = document.lineAt(start.line);
		console.log(`provideCodeActions, content: ${lineContent}`)

		const toggleHeadingUp = await this.toggleHeadingUp(document, lineContent)
		if (toggleHeadingUp) {
			codeActions.push(toggleHeadingUp)
		}
		const toggleHeadingDown = await this.toggleHeadingDown(document, lineContent)
		if (toggleHeadingDown) {
			codeActions.push(toggleHeadingDown)
		}
		const toggleBold = await this.toggleBold(document, lineContent)
		if (toggleBold) {
			codeActions.push(toggleBold)
		}
		const toggleItalic = await this.toggleItalic(document, lineContent)
		if (toggleItalic) {
			codeActions.push(toggleItalic)
		}
		const toggleStrikethrough = await this.toggleStrikethrough(document, lineContent)
		if (toggleStrikethrough) {
			codeActions.push(toggleStrikethrough)
		}
		const toggleCodeSpan = await this.toggleCodeSpan(document, lineContent)
		if (toggleCodeSpan) {
			codeActions.push(toggleCodeSpan)
		}
		const toggleOrderedList = await this.toggleOrderedList(document, lineContent)
		if (toggleOrderedList) {
			codeActions.push(toggleOrderedList)
		}
		const toggleUnorderedList = await this.toggleUnorderedList(document, lineContent)
		if (toggleUnorderedList) {
			codeActions.push(toggleUnorderedList)
		}
		const toggleTaskCodeAction = await this.toggleTaskCodeAction(document, lineContent)
		if (toggleTaskCodeAction) {
			codeActions.push(toggleTaskCodeAction)
		}

		const insertCodeBlock = await this.insertCodeBlock(document, lineContent)
		if (insertCodeBlock) {
			codeActions.push(insertCodeBlock)
		}
		const insertImageBlockCodeAction = await this.insertImageBlockCodeAction(document, lineContent)
		if (insertImageBlockCodeAction) {
			codeActions.push(insertImageBlockCodeAction)
		}
		const insertLinkBlockCodeAction = await this.insertLinkBlockCodeAction(document, lineContent)
		if (insertLinkBlockCodeAction) {
			codeActions.push(insertLinkBlockCodeAction)
		}
		const insertTableCodeAction = await this.insertTableCodeAction(document, lineContent)
		if (insertTableCodeAction) {
			codeActions.push(insertTableCodeAction)
		}
		const insertMermaidBlockCodeAction = await this.insertMermaidBlockCodeAction(document, lineContent)
		if (insertMermaidBlockCodeAction) {
			codeActions.push(insertMermaidBlockCodeAction)
		}

		const imageAddrImageStyleToBase64ImageStyleJob = this.imageAddrImageStyleToBase64ImageStyle(document, range, lineContent.text);
		const base64ContentToBase64ImageStyleJob = this.base64ContentToBase64ImageStyle(document, range, lineContent.text);
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

	async toggleHeadingUp(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Header Up`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' H+ ', // CodeAction 显示的文字
			command: 'extension.editor.toggleHeadingUp',
			arguments: []
		};
		return codeAction;
	}

	async toggleHeadingDown(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Header Down`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' H- ', // CodeAction 显示的文字
			command: 'extension.editor.toggleHeadingDown',
			arguments: []
		};
		return codeAction;
	}

	async toggleBold(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Toggle Bold`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' Bold ', // CodeAction 显示的文字
			command: 'extension.editor.toggleBold',
			arguments: []
		};
		return codeAction;
	}

	async toggleItalic(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Toggle Italic`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' Italic ', // CodeAction 显示的文字
			command: 'extension.editor.toggleItalic',
			arguments: []
		};
		return codeAction;
	}

	async toggleStrikethrough(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Toggle Strikethrough`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' Strikethrough ', // CodeAction 显示的文字
			command: 'extension.editor.toggleStrikethrough',
			arguments: []
		};
		return codeAction;
	}

	async toggleOrderedList(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Toggle Number List`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' NumList ', // CodeAction 显示的文字
			command: 'extension.editor.toggleOrderedList',
			arguments: []
		};
		return codeAction;
	}


	async toggleUnorderedList(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Toggle Dash List`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' DashList ', // CodeAction 显示的文字
			command: 'extension.editor.toggleUnorderedList',
			arguments: []
		};
		return codeAction;
	}

	async toggleCodeSpan(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Toggle Code Span`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' CodeSpan ', // CodeAction 显示的文字
			command: 'extension.editor.toggleCodeSpan',
			arguments: []
		};
		return codeAction;
	}

	async toggleTaskCodeAction(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Toggle Task List`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' Task ',
			command: 'extension.editor.toggleTaskList',
			arguments: [],
		};
		return codeAction;
	}

	async insertCodeBlock(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Insert Code Block`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' ➕Code ', // CodeAction 显示的文字
			command: 'extension.editor.insertCodeBlock',
			arguments: []
		};
		return codeAction;
	}

	async insertImageBlockCodeAction(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Insert Image Block`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' ➕Image ',
			command: 'extension.editor.insertImageBlock',
			arguments: [],
		};
		return codeAction;
	}

	async insertLinkBlockCodeAction(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Insert Link Block`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' ➕Link ',
			command: 'extension.editor.insertLinkBlock',
			arguments: [],
		};
		return codeAction;
	}

	async insertTableCodeAction(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Insert Table`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' ➕Table ',
			command: 'extension.editor.insertTableBlock',
			arguments: [],
		};
		return codeAction;
	}

	async insertMermaidBlockCodeAction(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeAction| undefined> {
		const codeAction = new vscode.CodeAction(`Insert Mermaid`, vscode.CodeActionKind.QuickFix);
		codeAction.command = {
			title: ' ➕Mermaid ',
			command: 'extension.editor.insertMermaid',
			arguments: [],
		};
		return codeAction;
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
