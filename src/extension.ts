/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { CodeActionsProvider } from './code_actions_provider';
import { pasteLink } from './utils/parse_link_utils';
import { CodeLensProvider } from './code_lens_provider';
import * as commands from './utils/commands';
import * as formatting from './utils/formatting';

export function activate(context: vscode.ExtensionContext) {
	commands.activate(context)
	formatting.activate(context)
	context.subscriptions.push(vscode.commands.registerCommand('extension.pasteUrl', pasteLink));
	context.subscriptions.push(vscode.languages.registerCodeActionsProvider('markdown', new CodeActionsProvider(context), {
		providedCodeActionKinds: CodeActionsProvider.providedCodeActionKinds
	}));
	context.subscriptions.push(vscode.languages.registerCodeLensProvider(
		CodeLensProvider.selector,
		new CodeLensProvider(context)
	));
}