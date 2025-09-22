import * as vscode from 'vscode';
import { doSomeThing } from './doSomeThing';
import { registerNbSerializer } from './serializer';
import { registerNbController } from './controller';
import { registerCommands } from './commands';

export function activate(context: vscode.ExtensionContext) {
	registerNbSerializer(context);
	registerNbController(context);
	registerCommands(context);
}

// This method is called when your extension is deactivated
export function deactivate() { }
