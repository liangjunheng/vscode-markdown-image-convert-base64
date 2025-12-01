import * as vscode from 'vscode';

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
		if(vscode.window.activeTextEditor) {
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
		const lineContent = document.lineAt(this.currentLine).text;

		const codeLensList: vscode.CodeLens[] = []

		const toggleHeadingUp = await this.toggleHeadingUp(document, this.currentLine);
		if (toggleHeadingUp) {
			codeLensList.push(toggleHeadingUp)
		}
		const toggleHeadingDown = await this.toggleHeadingDown(document, this.currentLine);
		if (toggleHeadingDown) {
			codeLensList.push(toggleHeadingDown)
		}
		const toggleBold = await this.toggleBold(document, this.currentLine);
		if (toggleBold) {
			codeLensList.push(toggleBold)
		}
		const toggleItalic = await this.toggleItalic(document, this.currentLine);
		if (toggleItalic) {
			codeLensList.push(toggleItalic)
		}
		const toggleStrikethrough = await this.toggleStrikethrough(document, this.currentLine);
		if (toggleStrikethrough) {
			codeLensList.push(toggleStrikethrough)
		}
		const toggleList = await this.toggleList(document, this.currentLine);
		if (toggleList) {
			codeLensList.push(toggleList)
		}
		const insertTaskCodeLens = await this.insertTaskCodeLens(document, this.currentLine);
		if (insertTaskCodeLens) {
			codeLensList.push(insertTaskCodeLens)
		}
		const insertCodeBlock = await this.insertCodeBlock(document, this.currentLine);
		if (insertCodeBlock) {
			codeLensList.push(insertCodeBlock)
		}
		const insertImageBlockCodeLens = await this.insertImageBlockCodeLens(document, this.currentLine);
		if (insertImageBlockCodeLens) {
			codeLensList.push(insertImageBlockCodeLens)
		}
		const insertLinkBlockCodeLens = await this.insertLinkBlockCodeLens(document, this.currentLine);
		if (insertLinkBlockCodeLens) {
			codeLensList.push(insertLinkBlockCodeLens)
		}
		const insertTableCodeLens = await this.insertTableCodeLens(document, this.currentLine);
		if (insertTableCodeLens) {
			codeLensList.push(insertTableCodeLens)
		}
		const insertMermaidBlockCodeLens = await this.insertMermaidBlockCodeLens(document, this.currentLine);
		if (insertMermaidBlockCodeLens) {
			codeLensList.push(insertMermaidBlockCodeLens)
		}
		return codeLensList;
	}

	async toggleHeadingUp(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const line = document.lineAt(currentLine)
		const command: vscode.Command = {
			title: ' H+ ', // CodeLens 显示的文字
			command: 'extension.editor.toggleHeadingUp',
			arguments: []
		};
		return new vscode.CodeLens(line.range, command);
	}

	async toggleHeadingDown(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const line = document.lineAt(currentLine)
		const command: vscode.Command = {
			title: ' H- ', // CodeLens 显示的文字
			command: 'extension.editor.toggleHeadingDown',
			arguments: []
		};
		return new vscode.CodeLens(line.range, command);
	}

	async toggleBold(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const line = document.lineAt(currentLine)
		const command: vscode.Command = {
			title: ' Bold ', // CodeLens 显示的文字
			command: 'extension.editor.toggleBold',
			arguments: []
		};
		return new vscode.CodeLens(line.range, command);
	}

	async toggleItalic(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const line = document.lineAt(currentLine)
		const command: vscode.Command = {
			title: ' Italic ', // CodeLens 显示的文字
			command: 'extension.editor.toggleItalic',
			arguments: []
		};
		return new vscode.CodeLens(line.range, command);
	}

	async toggleStrikethrough(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const line = document.lineAt(currentLine)
		const command: vscode.Command = {
			title: ' Strike through ', // CodeLens 显示的文字
			command: 'extension.editor.toggleStrikethrough',
			arguments: []
		};
		return new vscode.CodeLens(line.range, command);
	}

	async insertCodeBlock(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const line = document.lineAt(currentLine)
		const command: vscode.Command = {
			title: ' ➕Code ', // CodeLens 显示的文字
			command: 'extension.editor.insertCodeBlock',
			arguments: []
		};
		return new vscode.CodeLens(line.range, command);
	}

	async toggleList(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const line = document.lineAt(currentLine)
		const command: vscode.Command = {
			title: ' Fix List ', // CodeLens 显示的文字
			command: 'extension.editor.toggleList',
			arguments: []
		};
		return new vscode.CodeLens(line.range, command);
	}

	async insertTaskCodeLens(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const line = document.lineAt(currentLine)
		var snippet = "- [${1| ,x|}] ${2:text}"
		const lineContent = document.lineAt(currentLine).text
		if (lineContent.trim() !== '') {
			snippet = `- [\${1| ,x|}] ${lineContent}`
		}
		const image: vscode.Command = {
			title: ' Task ',
			command: 'extension.insertSnippetWithRange',
			arguments: [{
				snippet: snippet,
				selection: line.range
			}],
		};
		return new vscode.CodeLens(line.range, image);
	}

	async insertImageBlockCodeLens(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const line = document.lineAt(currentLine)
		let snippet = "![${1:alt text}](${2:image.png})"
		if(line.text && line.text !== '') {
			snippet = `![\${1:alt text}](${line.text})`
		}
		const image: vscode.Command = {
			title: ' ➕Image ',
			command: 'extension.editor.insertImageBlock',
			arguments: [],
		};
		return new vscode.CodeLens(line.range, image);
	}

	async insertLinkBlockCodeLens(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const line = document.lineAt(currentLine)
		const image: vscode.Command = {
			title: ' ➕Link ',
			command: 'extension.editor.insertLinkBlock',
			arguments: [],
		};
		return new vscode.CodeLens(line.range, image);
	}

	async insertTableCodeLens(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const line = document.lineAt(currentLine)
		const image: vscode.Command = {
			title: ' ➕Table ',
			command: 'extension.editor.insertTableBlock',
			arguments: [],
		};
		return new vscode.CodeLens(line.range, image);
	}

	async insertMermaidBlockCodeLens(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const line = document.lineAt(currentLine)
		const image: vscode.Command = {
			title: ' ➕Mermaid ',
			command: 'extension.editor.insertMermaid',
			arguments: [],
		};
		return new vscode.CodeLens(line.range, image);
	}

	resolveCodeLens(
		codeLens: vscode.CodeLens,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.CodeLens> {
		// 简单场景直接返回即可
		return codeLens;
	}
}