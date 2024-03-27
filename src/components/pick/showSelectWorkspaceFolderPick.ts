import { workspace } from 'vscode';
import showEscPick, { EscPickOptions } from './showEscPick';

/**
 * 通用工作空间选择器
 * @param options 选择器配置
 * @returns 
 */
export default async function showSelectWorkspaceFolderPick(options: EscPickOptions) {
  const wfs = workspace.workspaceFolders;
  if (wfs === undefined || wfs.length === 0) {
    return undefined;
  }
  if (wfs.length === 1) {
    return wfs[0];
  }
  const result = await showEscPick(wfs.map(w => w.name), options);
  return wfs.find(w => w.name === result);
}