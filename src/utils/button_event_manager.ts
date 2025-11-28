import * as vscode from 'vscode';


export async function insertLinkBlockTipsCodeAction(document: vscode.TextDocument, range: vscode.Range, lineContent: string): Promise<vscode.CodeAction | undefined> {
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


export async function insertImageBlockTipsCodeAction(document: vscode.TextDocument, range: vscode.Range, lineContent: string): Promise<vscode.CodeAction | undefined> {
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

export async function insertTableTipsCodeAction(document: vscode.TextDocument, range: vscode.Range, lineContent: string): Promise<vscode.CodeAction | undefined> {
	if (lineContent.trim() !== '' && lineContent !== 'table') {
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

export async function insertTaskTipsCodeAction(document: vscode.TextDocument, range: vscode.Range, lineContent: string): Promise<vscode.CodeAction | undefined> {
	if (lineContent.trim() !== '' && lineContent !== 'task') {
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

export async function insertMermaidTipsCodeAction(document: vscode.TextDocument, range: vscode.Range, lineContent: string): Promise<vscode.CodeAction | undefined> {
	if (lineContent.trim() !== '' && lineContent !== 'mermaid') {
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