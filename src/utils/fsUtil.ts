import { Uri, workspace } from 'vscode';

/**
 * 资源是否存在
 * @param uri 资源路径
 * @returns 
 */
async function isExists(uri: Uri) {
  try {
    await workspace.fs.stat(uri);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * 获取文件夹子文件列表
 * @param folder 文件夹路径
 * @returns 
 */
async function readDirectory(folder: Uri) {
  return (await workspace.fs.readDirectory(folder));
}

/**
 * 读取文件内容
 * @param doc 文件路径
 * @param encoding 编码格式
 * @returns 
 */
async function readFile(doc: Uri, encoding: BufferEncoding = 'utf-8') {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(await workspace.fs.readFile(doc));
}

export default {
  isExists,
  readDirectory,
  readFile
};