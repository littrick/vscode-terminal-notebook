import * as vscode from 'vscode';

const surportedLangs = "TerminalNoteBook.LanguageId Surported";


export function getSurportLangs(): Array<string>{
    return vscode.workspace.getConfiguration().get<Array<string>>(surportedLangs) as string[];
}