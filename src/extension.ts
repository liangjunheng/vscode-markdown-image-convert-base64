/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { MDBase64er } from './MDBase64er';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('markdown', new MDBase64er(), {
			providedCodeActionKinds: MDBase64er.providedCodeActionKinds
		}));
}