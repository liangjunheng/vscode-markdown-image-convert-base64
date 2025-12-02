import * as vscode from 'vscode';
import { isEnableLineTools } from './config_manager';

export class CodeLensProvider implements vscode.CodeLensProvider {
	static readonly selector: vscode.DocumentSelector = {
		language: 'markdown',
		scheme: 'file'
	};

	// 通知更新
	private readonly _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
	readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
	// 当前行
	private currentLine: number | undefined = 0;

	constructor(context: vscode.ExtensionContext) {
		console.log(`CodeLensProvider, constructor start`);
		this.initTextSelectionListener(context)
	}

	// 切换行时，自动触发quickFix
	initTextSelectionListener(context: vscode.ExtensionContext) {
		var lastLine = -1;
		if (vscode.window.activeTextEditor) {
			this.setCurrentLine(vscode.window.activeTextEditor.selection.start.line)
		}
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
			this.setCurrentLine(currentLine);
		});
		context.subscriptions.push(disposable);
	}

	public setCurrentLine(line: number | undefined) {
		this.currentLine = line;
		this._onDidChangeCodeLenses.fire();
	}

	async provideCodeLenses(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): Promise<vscode.CodeLens[]> {
		if (this.currentLine === undefined || this.currentLine < 0 || this.currentLine >= document.lineCount) {
			return [];
		}
		const lineContent = document.lineAt(this.currentLine);

		const codeLensList: vscode.CodeLens[] = []

		const toggleHeadingUp = await this.toggleHeadingUp(document, lineContent);
		if (toggleHeadingUp) {
			codeLensList.push(toggleHeadingUp)
		}
		const toggleHeadingDown = await this.toggleHeadingDown(document, lineContent);
		if (toggleHeadingDown) {
			codeLensList.push(toggleHeadingDown)
		}
		const toggleBold = await this.toggleBold(document, lineContent);
		if (toggleBold) {
			codeLensList.push(toggleBold)
		}
		const toggleItalic = await this.toggleItalic(document, lineContent);
		if (toggleItalic) {
			codeLensList.push(toggleItalic)
		}
		const toggleStrikethrough = await this.toggleStrikethrough(document, lineContent);
		if (toggleStrikethrough) {
			codeLensList.push(toggleStrikethrough)
		}
		const toggleOrderedList = await this.toggleOrderedList(document, lineContent);
		if (toggleOrderedList) {
			codeLensList.push(toggleOrderedList)
		}
		const toggleUnorderedList = await this.toggleUnorderedList(document, lineContent);
		if (toggleUnorderedList) {
			codeLensList.push(toggleUnorderedList)
		}
		const toggleCodeSpan = await this.toggleCodeSpan(document, lineContent);
		if (toggleCodeSpan) {
			codeLensList.push(toggleCodeSpan)
		}
		const insertTaskCodeLens = await this.insertTaskCodeLens(document, lineContent);
		if (insertTaskCodeLens) {
			codeLensList.push(insertTaskCodeLens)
		}
		const insertCodeBlock = await this.insertCodeBlock(document, lineContent);
		if (insertCodeBlock) {
			codeLensList.push(insertCodeBlock)
		}
		const insertImageBlockCodeLens = await this.insertImageBlockCodeLens(document, lineContent);
		if (insertImageBlockCodeLens) {
			codeLensList.push(insertImageBlockCodeLens)
		}
		const insertLinkBlockCodeLens = await this.insertLinkBlockCodeLens(document, lineContent);
		if (insertLinkBlockCodeLens) {
			codeLensList.push(insertLinkBlockCodeLens)
		}
		const insertTableCodeLens = await this.insertTableCodeLens(document, lineContent);
		if (insertTableCodeLens) {
			codeLensList.push(insertTableCodeLens)
		}
		const insertMermaidBlockCodeLens = await this.insertMermaidBlockCodeLens(document, lineContent);
		if (insertMermaidBlockCodeLens) {
			codeLensList.push(insertMermaidBlockCodeLens)
		}
		return codeLensList;
	}

	async toggleHeadingUp(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' H+ ', // CodeLens 显示的文字
			command: 'extension.editor.toggleHeadingUp',
			arguments: []
		};
		return new vscode.CodeLens(currentLine.range, command);
	}

	async toggleHeadingDown(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' H- ', // CodeLens 显示的文字
			command: 'extension.editor.toggleHeadingDown',
			arguments: []
		};
		return new vscode.CodeLens(currentLine.range, command);
	}

	async toggleBold(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' Bold ', // CodeLens 显示的文字
			command: 'extension.editor.toggleBold',
			arguments: []
		};
		return new vscode.CodeLens(currentLine.range, command);
	}

	async toggleItalic(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' Italic ', // CodeLens 显示的文字
			command: 'extension.editor.toggleItalic',
			arguments: []
		};
		return new vscode.CodeLens(currentLine.range, command);
	}

	async toggleStrikethrough(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' Strikethrough ', // CodeLens 显示的文字
			command: 'extension.editor.toggleStrikethrough',
			arguments: []
		};
		return new vscode.CodeLens(currentLine.range, command);
	}

	async toggleOrderedList(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' NumList ', // CodeLens 显示的文字
			command: 'extension.editor.toggleOrderedList',
			arguments: []
		};
		return new vscode.CodeLens(currentLine.range, command);
	}


	async toggleUnorderedList(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' DashList ', // CodeLens 显示的文字
			command: 'extension.editor.toggleUnorderedList',
			arguments: []
		};
		return new vscode.CodeLens(currentLine.range, command);
	}

	async toggleCodeSpan(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' CodeSpan ', // CodeLens 显示的文字
			command: 'extension.editor.toggleCodeSpan',
			arguments: []
		};
		return new vscode.CodeLens(currentLine.range, command);
	}

	async insertTaskCodeLens(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' Task ',
			command: 'extension.editor.toggleTaskList',
			arguments: [],
		};
		return new vscode.CodeLens(currentLine.range, command);
	}

	async insertCodeBlock(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' ➕Code ', // CodeLens 显示的文字
			command: 'extension.editor.insertCodeBlock',
			arguments: []
		};
		return new vscode.CodeLens(currentLine.range, command);
	}

	async insertImageBlockCodeLens(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' ➕Image ',
			command: 'extension.editor.insertImageBlock',
			arguments: [],
		};
		return new vscode.CodeLens(currentLine.range, command);
	}

	async insertLinkBlockCodeLens(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' ➕Link ',
			command: 'extension.editor.insertLinkBlock',
			arguments: [],
		};
		return new vscode.CodeLens(currentLine.range, command);
	}

	async insertTableCodeLens(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' ➕Table ',
			command: 'extension.editor.insertTableBlock',
			arguments: [],
		};
		return new vscode.CodeLens(currentLine.range, command);
	}

	async insertMermaidBlockCodeLens(document: vscode.TextDocument, currentLine: vscode.TextLine): Promise<vscode.CodeLens | undefined> {
		const command: vscode.Command = {
			title: ' ➕Mermaid ',
			command: 'extension.editor.insertMermaid',
			arguments: [],
		};
		return new vscode.CodeLens(currentLine.range, command);
	}

	resolveCodeLens(
		codeLens: vscode.CodeLens,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.CodeLens> {
		// 简单场景直接返回即可
		return codeLens;
	}
}