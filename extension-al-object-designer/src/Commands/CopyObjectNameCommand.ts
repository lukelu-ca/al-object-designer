import * as vscode from 'vscode';
import { ALPanel } from "../ALPanel";
import { ALCommandBase } from "./Base/ALCommandBase";
const clipboardy = require('clipboardy');

export class CopyObjectNameCommand extends ALCommandBase {

    public constructor(lObjectDesigner: ALPanel, lExtensionPath: string) {
        super(lObjectDesigner, lExtensionPath);
        this.showInfo = true;
    }

    async execute(message: any) {
        await clipboardy.write(message.Name);
        await vscode.window.showInformationMessage(`"${message.Name}" copied to clipboard.`);
        return;
    }
}