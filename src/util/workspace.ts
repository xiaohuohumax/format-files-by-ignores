import { Uri, WorkspaceFolder, window, workspace } from 'vscode';
import { OperationAborted } from '../error';

/**
 * 通过路径选择工作空间, 不存在则让用户选择
 * @param folder 工作空间路径
 * @throws {OperationAborted} workspace 未打开, 用户取消 中断
 * @returns 
 */
export async function selectWorkspace(folder?: Uri): Promise<WorkspaceFolder> {
    const wps = workspace.workspaceFolders;

    const fwps = wps?.find(w => w.uri.fsPath === folder?.fsPath);

    if (folder && wps && fwps) {
        // 有默认就使用默认
        return fwps;
    }

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