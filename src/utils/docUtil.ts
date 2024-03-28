import { Range, TextDocument, Uri, ViewColumn, WorkspaceEdit, commands, window, workspace } from 'vscode';
import pathUtil from './pathUtil';

/**
 * 格式化文档
 * @param doc 文档路径
 * @returns 
 */
async function formatDocument(doc: Uri, organizeImports: boolean): Promise<boolean> {
  try {
    // 尝试打开文档
    await workspace.openTextDocument(doc);

    // 显示文档
    await window.showTextDocument(doc, { preview: false, viewColumn: ViewColumn.One });
    if (organizeImports) {
      // 格式化 import 语句
      await commands.executeCommand('editor.action.organizeImports');
    }
    // 格式化文档
    await commands.executeCommand('editor.action.formatDocument');
    // 保存文档
    await commands.executeCommand('workbench.action.files.save');
    // todo 记录执行命令前文档状态, 已经打开的则不关闭
    // 关闭文档
    await commands.executeCommand('workbench.action.closeActiveEditor');
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * 后缀统计
 */
export interface DocumentsStatExt {
  [key: string]: number
}

/**
 * 文档统计
 */
export interface DocumentsStat {
  /**
   * 文档总数
   */
  count: number
  /**
   * 扩展名统计
   */
  ext: DocumentsStatExt
}

/**
 * 文档统计
 * @param docs 文档列表
 * @returns 
 */
function statDocuments(docs: Uri[]): DocumentsStat {
  const res: DocumentsStat = {
    count: docs.length,
    ext: {}
  };

  for (const doc of docs) {
    let ext = pathUtil.extname(doc);
    ext = ext || pathUtil.basename(doc);
    // 后缀名不存在则使用文档名
    res.ext[ext] = ++(res.ext[ext]) || 1;
  }

  return res;
}

/**
 * 创建文档
 * @param content 文档内容
 * @param language 文档语言类型
 * @returns 
 */
async function createDocument(content: string, language: string = 'plaintext') {
  const doc = await workspace.openTextDocument({ language, content });
  await window.showTextDocument(doc);
  return doc;
}

/**
 * 更新文档内容
 * @param doc 文档
 * @param content 新内容
 */
async function updateDocument(doc: TextDocument, content: string) {
  const edit = new WorkspaceEdit();
  edit.replace(doc.uri, new Range(0, 0, doc.lineCount, 0), content);
  await workspace.applyEdit(edit);
}

/**
 * 关闭文档
 * @param doc 文档
 * @returns 
 */
async function closeDocument(doc: TextDocument) {
  try {
    if (doc.isClosed) {
      return;
    }
    await window.showTextDocument(doc);
    await commands.executeCommand('workbench.action.closeActiveEditor');
    // eslint-disable-next-line no-empty
  } catch (_) { }
}

export default {
  formatDocument,
  statDocuments,
  createDocument,
  updateDocument,
  closeDocument
};