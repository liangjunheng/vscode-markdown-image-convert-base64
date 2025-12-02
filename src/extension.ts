/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { CodeActionsProvider } from './code_actions_provider';
import { pasteLink } from './utils/parse_link_utils';
import { CodeLensProvider } from './code_lens_provider';
import * as commands from './utils/commands';
import * as formatting from './utils/formatting';
import { isEnableLineTools } from './config_manager';

export function activate(context: vscode.ExtensionContext) {
	formatting.activate(context)
	commands.activate(context)
	context.subscriptions.push(vscode.commands.registerCommand('extension.pasteUrl', pasteLink));
	context.subscriptions.push(vscode.languages.registerCodeActionsProvider('markdown', new CodeActionsProvider(context), {
		providedCodeActionKinds: CodeActionsProvider.providedCodeActionKinds
	}));
	if(isEnableLineTools()) {
		context.subscriptions.push(vscode.languages.registerCodeLensProvider(
			CodeLensProvider.selector,
			new CodeLensProvider(context)
		));
	}
}