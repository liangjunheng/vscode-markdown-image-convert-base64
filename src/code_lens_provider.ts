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

		const insertHeaderIncreaseCodeLens = await this.insertHeaderIncreaseCodeLens(document, this.currentLine);
		if (insertHeaderIncreaseCodeLens) {
			codeLensList.push(insertHeaderIncreaseCodeLens)
		}
		const insertHeaderReduceCodeLens = await this.insertHeaderReduceCodeLens(document, this.currentLine);
		if (insertHeaderReduceCodeLens) {
			codeLensList.push(insertHeaderReduceCodeLens)
		}
		const insertTaskCodeLens = await this.insertTaskCodeLens(document, this.currentLine);
		if (insertTaskCodeLens) {
			codeLensList.push(insertTaskCodeLens)
		}
		const insertImageBlockCodeLens = await this.insertImageBlockCodeLens(document, this.currentLine);
		if (insertImageBlockCodeLens && lineContent === '') {
			codeLensList.push(insertImageBlockCodeLens)
		}
		const insertLinkBlockCodeLens = await this.insertLinkBlockCodeLens(document, this.currentLine);
		if (insertLinkBlockCodeLens && lineContent === '') {
			codeLensList.push(insertLinkBlockCodeLens)
		}
		const insertTableCodeLens = await this.insertTableCodeLens(document, this.currentLine);
		if (insertTableCodeLens && lineContent === '') {
			codeLensList.push(insertTableCodeLens)
		}
		const insertMermaidBlockCodeLens = await this.insertMermaidBlockCodeLens(document, this.currentLine);
		if (insertMermaidBlockCodeLens && lineContent === '') {
			codeLensList.push(insertMermaidBlockCodeLens)
		}
		return codeLensList;
	}

	async insertHeaderIncreaseCodeLens(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const range = new vscode.Range(
			new vscode.Position(currentLine, 0),
			new vscode.Position(currentLine, 0)
		);
		const image: vscode.Command = {
			title: 'H+', // CodeLens 显示的文字
			command: 'extension.cursorCodeLensAction',
			arguments: [
				{
					uri: document.uri,
					line: this.currentLine
				}
			]
		};
		return new vscode.CodeLens(range, image);
	}

	async insertHeaderReduceCodeLens(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const range = new vscode.Range(
			new vscode.Position(currentLine, 0),
			new vscode.Position(currentLine, 0)
		);
		const image: vscode.Command = {
			title: 'H-', // CodeLens 显示的文字
			command: 'extension.cursorCodeLensAction',
			arguments: [
				{
					uri: document.uri,
					line: this.currentLine
				}
			]
		};
		return new vscode.CodeLens(range, image);
	}

	async insertTaskCodeLens(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const range = new vscode.Range(
			new vscode.Position(currentLine, 0),
			new vscode.Position(currentLine, 0)
		);
		const image: vscode.Command = {
			title: 'Task List',
			command: 'editor.action.insertSnippet',
			arguments: [{
				snippet: "- [${1| ,x|}] ${2:text}",
			}],
		};
		return new vscode.CodeLens(range, image);
	}

	async insertImageBlockCodeLens(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const range = new vscode.Range(
			new vscode.Position(currentLine, 0),
			new vscode.Position(currentLine, 0)
		);
		const image: vscode.Command = {
			title: 'Image Block',
			command: 'editor.action.insertSnippet',
			arguments: [{
				snippet: "![${1:title}](${2:image.png})",
			}],
		};
		return new vscode.CodeLens(range, image);
	}

	async insertLinkBlockCodeLens(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const range = new vscode.Range(
			new vscode.Position(currentLine, 0),
			new vscode.Position(currentLine, 0)
		);
		const image: vscode.Command = {
			title: 'Link Block',
			command: 'editor.action.insertSnippet',
			arguments: [{
				snippet: "[${1:title}](${2:https://example.com})",
			}],
		};
		return new vscode.CodeLens(range, image);
	}

	async insertTableCodeLens(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const range = new vscode.Range(
			new vscode.Position(currentLine, 0),
			new vscode.Position(currentLine, 0)
		);
		const image: vscode.Command = {
			title: 'Table Block',
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
		return new vscode.CodeLens(range, image);
	}

	async insertMermaidBlockCodeLens(document: vscode.TextDocument, currentLine: number): Promise<vscode.CodeLens | undefined> {
		const range = new vscode.Range(
			new vscode.Position(currentLine, 0),
			new vscode.Position(currentLine, 0)
		);
		const image: vscode.Command = {
			title: 'Mermaid Block',
			command: 'editor.action.insertSnippet',
			arguments: [{
				snippet: "```mermaid\n${1}\n```",
			}],
		};
		return new vscode.CodeLens(range, image);
	}

	resolveCodeLens(
		codeLens: vscode.CodeLens,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.CodeLens> {
		// 简单场景直接返回即可
		return codeLens;
	}
}