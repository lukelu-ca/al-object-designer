import * as vscode from 'vscode';
import * as utils from './utils';
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs-extra');

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
        if ((await fs.pathExists(this.savePath)) == false) {
            await fs.ensureFile(this.savePath);
        }

        return new Promise((resolve, reject) => {
            
            const bat = spawn(this.bridgeExePath, [this.alLanguagePath, this.savePath]);

            bat.stderr.on('data', (data: any) => {
                reject(data.toString());
            });

            bat.on('exit', async (code: any) => {
                let contents: any = await utils.read(this.savePath);
                let jsonContent = JSON.parse(contents) as Object;
                resolve(jsonContent);
            });
        });
    }

    mergeProperties(objectPart: string, existingProps: any, cachedProps: any) {
        let checkProps = cachedProps.filter((f: any) => f.Name === objectPart);
        checkProps = checkProps[0].Properties;

        for (let p of existingProps) {
            let checkProp = checkProps.filter((f: any) => f.Name === p.Name);
            if (checkProp.length > 0) {            
                checkProp = checkProp[0];
                checkProp.Value = p.Value;
                let updateIndex = checkProps.indexOf(checkProp);
                checkProps[updateIndex] = checkProp;
            }
        }

        return checkProps;
    }
}