'use strict';

import * as vscode from 'vscode';
import { ALPanel } from './ALPanel';
import { ALObjectDesigner } from './ALModules';
import querystring = require('querystring');

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.openALWindow', async () => {
        try {
            await ALPanel.open(context.extensionPath, ALObjectDesigner.PanelMode.List);
        } catch (e) {
            console.error(e);
            vscode.window.showErrorMessage(`AL Object Designer could not be opened. Error: '${e.message}'`);
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.openALDesignWindow', async () => {
        try {
            await ALPanel.openDesigner(context.extensionPath);
        } catch (e) {
            console.error(e);
            vscode.window.showErrorMessage(`AL Page Designer could not be opened. Error: '${e.message}'`);
        }
    }));

    context.subscriptions.push(vscode.window.registerUriHandler(<vscode.UriHandler>{
        async handleUri(uri: vscode.Uri) {
            let q = querystring.parse(uri.query);
            q.FsPath = "";
            await ALPanel.command(context.extensionPath, q);
            vscode.window.showInformationMessage(JSON.stringify(q));
        }
    }));

}

// this method is called when your extension is deactivated
export function deactivate() {
}