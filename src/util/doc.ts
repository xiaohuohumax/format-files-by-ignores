import { ProgressLocation, Uri, ViewColumn, commands, window, workspace } from 'vscode';
import { OperationAborted } from '../error';
import { Logger } from './logger';
import path from 'path';

/**
 * 尝试打开文档
 * @param doc 文档路径
 * @returns 
 */
export async function tryOpenDoc(doc: Uri) {
  try {
    return await workspace.openTextDocument(doc.fsPath);
    // eslint-disable-next-line no-empty
  } catch (_) { }
}

/**
 * 利用 vscode 内置指令格式化文件
 * @param doc 文档路径
 */
export async function formatDoc(doc: Uri): Promise<void> {
  if (await tryOpenDoc(doc)) {
    await window.showTextDocument(doc, { preview: false, viewColumn: ViewColumn.One });
    await commands.executeCommand('editor.action.formatDocument');
    await commands.executeCommand('workbench.action.files.save');
    // todo 记录执行命令前文件状态, 已经打开的则不关闭
    await commands.executeCommand('workbench.action.closeActiveEditor');
  }
}

/**
 * 批量格式化文件
 * @param docs 档路径集合
 * @throws {OperationAborted} 取消中断
 */
export async function formatDocs(docs: Uri[]) {
  // 进度
  const increment = (1 / docs.length) * 100;

  // 进度条
  await window.withProgress(
    {
      cancellable: true,
      location: ProgressLocation.Notification,
      title: 'Formatting documents'
    },
    async (progress, token) => {
      let index = 0;
      for (const doc of docs) {
        if (token.isCancellationRequested) {
          // 中断取消
          throw new OperationAborted('Format cancelled');
        }
        progress.report({
          message: `(${++index}/${docs.length}) ${path.basename(doc.fsPath)}`
          , increment
        });
        Logger.debug('Format:', doc);
        await formatDoc(doc);
      }
      progress.report({ increment: 100 });
    }
  );
}

export interface DocStatExt {
  [key: string]: number
}

export interface DocStat {
  count: number
  ext: DocStatExt
}

/**
 * 统计文档信息
 * @param docs 文档集合
 */
export function statDoc(docs: Uri[]): DocStat {
  const res: DocStat = {
    count: docs.length,
    ext: {}
  };

  for (const doc of docs) {
    let ext = path.extname(doc.fsPath);
    ext = ext || path.basename(doc.fsPath);
    res.ext[ext] = ++(res.ext[ext]) || 1;
  }

  return res;
}