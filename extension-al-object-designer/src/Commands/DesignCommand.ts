import { ALPanel } from "../ALPanel";
import { ALCommandBase } from "./Base/ALCommandBase";
import { ALObjectParser } from '../ALObjectParser';
import { ALObjectDesigner } from '../ALModules';

export class DesignCommand extends ALCommandBase {

    public constructor(lObjectDesigner: ALPanel, lExtensionPath: string) {
        super(lObjectDesigner, lExtensionPath);
        this.showInfo = true;
    }

    async execute(message: any) {
        let parser = new ALObjectParser();
        message = await parser.updateCollectorItem(message);

        let mode = ALObjectDesigner.PanelMode.Design;
        switch (message.Type.toLowerCase()) {
            case 'table':
                mode = ALObjectDesigner.PanelMode.Table;
                break;
            // TODO: to be extended later
        }

        await ALPanel.open(this.extensionPath, mode, message);        
        return;
    }
}