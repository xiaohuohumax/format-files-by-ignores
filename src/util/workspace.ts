import { WorkspaceFolder, window, workspace } from 'vscode';
import { OperationAborted } from '../error';

/**
 * 选择工作空间文件夹
 * @throws {OperationAborted} workspace 未打开, 用户取消
 * @returns 
 */
export async function switchWorkspaceFolder(): Promise<WorkspaceFolder> {
  const wps = workspace.workspaceFolders;

  // 未打开工作空间
  if (wps === undefined || wps.length === 0) {
    throw new OperationAborted('Workspace not open');
  }

  // 只有一个工作空间则直接返回不需要选择
  if (wps.length === 1) {
    return wps[0];
  }

  const result = await window.showQuickPick(wps.map(w => w.name), {
    title: 'Select the workspace that needs to be formatted',
    ignoreFocusOut: true,
    placeHolder: 'Select workspace',
  });

  // 取消选择
  if (!result) {
    throw new OperationAborted('Select workspace cancelled');
  }

  return wps.find(w => w.name === result)!;
}