import * as vscode from 'vscode';
import { getSurportLangs } from './configuration';

export function registerNbController(context: vscode.ExtensionContext) {
    context.subscriptions.push(controller);
}

const controller = new (class {
    private readonly id = 'terminal-markdown-controller';
    private readonly type = 'TerminalNoteBook';
    private readonly label = 'Terminal markdown NoteBook';
    private readonly supportedLanguages = getSurportLangs();

    private readonly controller: vscode.NotebookController;

    constructor() {
        this.controller = vscode.notebooks.createNotebookController(
            this.id,
            this.type,
            this.label
        );
        this.controller.supportedLanguages = this.supportedLanguages;
        this.controller.executeHandler = this.doExecuteAll.bind(this);
    }

    private async doExecuteAll(
        cells: vscode.NotebookCell[],
        notebook: vscode.NotebookDocument,
        controller: vscode.NotebookController
    ): Promise<void> {
        for (let cell of cells) {
            this.doExecute(cell);
        }
    }

    private async doExecute(cell: vscode.NotebookCell): Promise<void> {
        let cmds = cell.document.getText().split(/\r?\n/g);
        cmds.forEach(value => {
            vscode.window.activeTerminal?.sendText(value);
        });
    }

    dispose() {
        this.controller.dispose();
    }
})();
