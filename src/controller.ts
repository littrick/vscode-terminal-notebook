import * as vscode from 'vscode';
import { setting } from './setting';
import { log } from './utils';


class ControllerHandle {
    private readonly id: string;
    private readonly type: string;
    private readonly label: string;
    private readonly supportedLanguages: () => string[];
    private readonly controller: vscode.NotebookController;

    constructor(id: string, type: string, label: string, supportedLanguages: () => string[]) {
        this.id = id;
        this.type = type;
        this.label = label;
        this.supportedLanguages = supportedLanguages;
        this.controller = vscode.notebooks.createNotebookController(
            this.id,
            this.type,
            this.label,
            this.doExecuteAll.bind(this)
        );
        this.controller.supportedLanguages = this.supportedLanguages();
    }

    private async doExecuteAll(
        cells: vscode.NotebookCell[],
        _notebook: vscode.NotebookDocument,
        _controller: vscode.NotebookController
    ): Promise<void> {
        for (const cell of cells) {
            await this.doExecute(cell);
        }
    }

    private doExecute(cell: vscode.NotebookCell): void {
        const terminal = vscode.window.activeTerminal;
        if (!terminal) { return; }
        log.info(this.type + " Sending: " + cell.document.getText());
        cell.document.getText().split(/\r?\n/g).forEach(cmd => terminal.sendText(cmd));
    }

    refreshSupportedLanguages() {
        this.controller.supportedLanguages = this.supportedLanguages();
    }

    dispose() {
        this.controller.dispose();
    }
}

const mdController = new ControllerHandle(
    'markdown-notebook-controller',
    'mdnb',
    vscode.l10n.t('Markdown Notebook'),
    () => setting.codeSuport
);

const scrnbController = new ControllerHandle(
    'script-notebook-controller',
    'scrnb',
    vscode.l10n.t('Script Notebook'),
    () => setting.codeSuport
);

function registerNbController(context: vscode.ExtensionContext) {
    context.subscriptions.push(mdController);
    context.subscriptions.push(scrnbController);
}

function refreshSupportedLanguages() {
    mdController.refreshSupportedLanguages();
    scrnbController.refreshSupportedLanguages();
}

export { registerNbController, refreshSupportedLanguages };