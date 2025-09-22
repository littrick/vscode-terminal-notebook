import * as vscode from 'vscode';


export function registerCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("TerminalNotebook.OpenNotebook", (uri?: vscode.Uri) => {
            vscode.commands.executeCommand("vscode.openWith", uri, "TerminalNoteBook");
        }));
}
