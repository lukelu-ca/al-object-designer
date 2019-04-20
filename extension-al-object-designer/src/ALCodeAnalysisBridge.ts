import * as vscode from 'vscode';
import * as utils from './utils';
const path = require('path');
const { spawn } = require('child_process');

export class ALCodeAnalysisBridge {

    extensionPath: string = '';
    alLanguagePath: string = '';
    bridgeExePath: string = '';
    savePath: string = '';

    constructor() {
        let context = vscode.extensions.getExtension('martonsagi.al-object-designer') as vscode.Extension<any>;
        this.extensionPath = context.extensionPath;
        let alExt = vscode.extensions.getExtension('microsoft.al') as vscode.Extension<any>;
        this.alLanguagePath = path.join(alExt.extensionPath, 'bin', 'Microsoft.Dynamics.Nav.CodeAnalysis.dll'),
            this.bridgeExePath = path.join(this.extensionPath, 'bin', 'ALCodeAnalysisBridge.exe');

        this.savePath = path.join((vscode.workspace.workspaceFolders as Array<vscode.WorkspaceFolder>)[0].uri.fsPath, '.alcache', 'properties.cache.json');
    }

    async cacheProperties() {
        await this.generatePropertyDictionary();

        let contents: any = await utils.read(this.savePath);
        let jsonContent = JSON.parse(contents) as Object;
        let keys = Object.keys(jsonContent);
        let newContent = [];
        for (let key of keys) {
            newContent.push({
                'name': key,
                'description': jsonContent[key]
            });
        }

        let newFile = newContent.filter(f => {
            return f.name.startsWith('Field_') === true;
        }).map(m => {
            return {
                'name': m.name.split('_').pop(),
                'description': m.description
            }
        });

        await utils.write(this.savePath, JSON.stringify(newFile));

        return newFile;
    }

    async generatePropertyDictionary() {        

        return new Promise((resolve, reject) => {
            const bat = spawn(this.bridgeExePath, [this.alLanguagePath, this.savePath]);

            bat.stderr.on('data', (data: any) => {
                reject(data.toString());
            });

            bat.on('exit', (code: any) => {
                resolve();
            });
        });
    }
}