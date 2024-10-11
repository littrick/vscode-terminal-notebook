import * as vscode from 'vscode';
import { doSomeThing } from './doSomeThing';
import { registerNbSerializer } from './serializer';
import { registerNbController } from './controller';

export function activate(context: vscode.ExtensionContext) {
	registerNbSerializer(context);
	registerNbController(context);

	const disposable = vscode.commands.registerCommand('terminalnotebook.helloWorld', () => {
		doSomeThing();
		vscode.window.showInformationMessage('Hello World from TerminalNoteBook!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
