import { Uri } from 'vscode';

/**
 * 获取资源名称
 * @param uri 资源路径
 * @returns 
 */
function basename(uri: Uri) {
  const p = uri.path.split('/');
  if (p.length === 0) {
    return '';
  }
  return p.pop() ?? '';
}

/**
 * 获取文档扩展名
 * @param doc 文档路径
 * @returns 
 */
function extname(doc: Uri) {
  const name = basename(doc);
  const exts = name.split('.');
  if (exts.length < 2 || (exts.length === 2 && name.startsWith('.'))) {
    return '';
  }
  return '.' + exts.pop()!;
}

export default {
  basename,
  extname
};