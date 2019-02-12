import * as vscode from 'vscode';
import { ALPanel } from "../ALPanel";
import { ALCommandBase } from "./Base/ALCommandBase";
import { ALObjectDesigner } from '../ALModules';

export class BrowserPreviewCommand extends ALCommandBase {

    public constructor(lObjectDesigner: ALPanel, lExtensionPath: string) {
        super(lObjectDesigner, lExtensionPath);
    }

    async execute(message: any) {
        if (['Table','Page','PageExtension','TableExtension','Report'].indexOf(message.Type) == -1) {
            await vscode.window.showErrorMessage(`${message.Type} objects cannot be run in Web Client.`)
            return;
        }

        // TODO
        vscode.commands.executeCommand('browser-preview.openPreview', 'http://localhost:8080/BC130/?page=31');
    }
}