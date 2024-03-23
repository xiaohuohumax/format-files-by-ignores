import { WorkspaceFolder, window, workspace } from 'vscode';
import { OperationAborted } from '../error';
import { FormatFolder } from './formatFolder';

/**
 * 格式化工作空间
 */
export class FilterWorkspace extends FormatFolder {

    /**
     * 选择需要格式化的工作空间
     * @returns 
     */
    private async selectWorkspace(): Promise<WorkspaceFolder> {
        const wps = workspace.workspaceFolders;

        // 未打开工作空间
        if (wps === undefined || wps.length === 0) {
            throw new OperationAborted('Workspace not open');
        }

        const result = await window.showQuickPick(wps.map(w => w.name), {
            title: `Select the workspace that needs to be formatted`,
            ignoreFocusOut: true,
            placeHolder: `Select workspace`,
        });

        // 取消选择
        if (!result) {
            throw new OperationAborted('Select workspace cancelled');
        }

        return wps.find(w => w.name === result)!;
    }

    async callback(): Promise<void> {
        const wp = await this.selectWorkspace();
        // 开始格式化
        await super.callback(wp.uri);
    }
}