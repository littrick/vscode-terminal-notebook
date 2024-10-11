import * as vscode from 'vscode';
import { getSurportLangs } from './configuration';


export function registerNbSerializer(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.registerNotebookSerializer('TerminalNoteBook', serializer));
}

const supportedLanguages = getSurportLangs();
const serializer = new (class implements vscode.NotebookSerializer {
    private is_code: boolean = false;
    private code_begin = 0;
    private code_lang: string = "";

    private readonly code_begin_regx = /```([a-zA-Z0-9]*)\s*$/;
    private readonly code_end_regx = /^```[\s]*?$/;
    private readonly all_new_line_regx = /^[\r\n]*?$/;

    private readonly id2langTab = new Map([
        ["shellscript", "sh"],
        ["plaintext", "txt"],
        ["raw", ""],
    ]);

    private id2lang(id: string) {
        return this.id2langTab.get(id) || id;
    }

    private CodeBlock(lang: string, content: string) {
        return ["```", lang, "\n", content, "\n", "```"].join('');
    }

    private CodeCell = (lang: string, content: string) =>
        new vscode.NotebookCellData(
            vscode.NotebookCellKind.Code,
            content,
            lang
        );

    private MdCell = (content: string) =>
        new vscode.NotebookCellData(
            vscode.NotebookCellKind.Markup,
            content,
            'markdown'
        );

    deserializeNotebook(content: Uint8Array, token: vscode.CancellationToken): vscode.NotebookData | Thenable<vscode.NotebookData> {
        const contents = new TextDecoder().decode(content);
        const lines = contents.split(/\r?\n/);
        var data: vscode.NotebookCellData[] = [];

        this.is_code = false;
        this.code_begin = 0;
        this.code_lang = "";

        lines.forEach((line, idx) => {
            if (this.is_code && this.code_end_regx.test(line)) {
                if (supportedLanguages.find((lang => lang === this.code_lang)) !== undefined) {
                    data.push(this.CodeCell(this.code_lang, lines.slice(this.code_begin, idx).join('\n')));
                } else {
                    const content = this.CodeBlock(this.code_lang, lines.slice(this.code_begin, idx).join('\n'));
                    data.push(this.MdCell(content));
                }

                this.is_code = false;
                this.code_begin = idx + 1;
            } else {
                const match = line.match(this.code_begin_regx);
                if (match) {
                    const content = lines.slice(this.code_begin, idx).join('\n');
                    if (!this.all_new_line_regx.test(content)) {
                        data.push(this.MdCell(content));
                    }
                    this.code_lang = match[1] || "raw";
                    this.is_code = true;
                    this.code_begin = idx + 1;
                }
            }
        });

        if (this.code_begin !== lines.length) {
            if (!this.is_code) {
                data.push(this.MdCell(lines.slice(this.code_begin, lines.length).join('\n')));
            } else {
                data.push(this.CodeCell(this.code_lang, lines.slice(this.code_begin, lines.length).join('\n')));
            }
        }

        return new vscode.NotebookData(data);
    }
    serializeNotebook(data: vscode.NotebookData, token: vscode.CancellationToken): Uint8Array | Thenable<Uint8Array> {
        return new TextEncoder().encode(data.cells.map((cell) => {
            if (cell.kind === vscode.NotebookCellKind.Markup) {
                return cell.value;
            } else {
                return this.CodeBlock(this.id2lang(cell.languageId), cell.value);
            }
        }).join('\n'));
    }
});