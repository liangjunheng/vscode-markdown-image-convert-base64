/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { CodeActionsProvider } from './code_actions_provider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('markdown', new CodeActionsProvider(context), {
			providedCodeActionKinds: CodeActionsProvider.providedCodeActionKinds
		}));
}