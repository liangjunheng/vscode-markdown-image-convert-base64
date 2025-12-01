import * as vscode from 'vscode';

export class SnippetArgs {
	readonly snippet: string = '';
	readonly selection: vscode.Selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0))
	constructor(snippet: string, selection: vscode.Selection) {
		this.snippet = snippet
		this.selection = selection
	}
}

export function activate(context: vscode.ExtensionContext) {
	let disposable_insertSnippetWithRange = vscode.commands.registerCommand('extension.insertSnippetWithRange', (args: SnippetArgs) => {
		console.log(`insertSnippetWithRange, snippets: ${args.snippet}, selectionStart: ${args.selection.start.line}, selectionEnd: ${args.selection.end.line}`)
		const editor = vscode.window.activeTextEditor
		if (editor) {
			editor.selection = args.selection
		}
		vscode.commands.executeCommand(
			'editor.action.insertSnippet',
			{
				snippet: args.snippet,
			}
		)
	});
	context.subscriptions.push(disposable_insertSnippetWithRange);
}
