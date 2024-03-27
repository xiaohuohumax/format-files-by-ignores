import { Config } from '@/config';
import { ECancelAborted } from '@/error';
import log from '@/log';
import msg from '@components/msg';
import showConfirmPick from '@components/pick/showConfirmPick';
import showSelectWorkspaceFolderPick from '@components/pick/showSelectWorkspaceFolderPick';
import docUtil from '@utils/docUtil';
import fsUtil from '@utils/fsUtil';
import listUtil from '@utils/listUtil';
import pathUtil from '@utils/pathUtil';
import ignore from 'ignore';
import { CancellationToken, FileType, LogLevel, Progress, ProgressLocation, TextDocument, Uri, commands, window } from 'vscode';
import ICmd from '../iCmd';
import tmpTitle from './tmpTitle.txt?raw';

type TaskProgress = Progress<{ message?: string; increment?: number; }>

/**
 * 格式化状态标识
 * 
 * vscode 上下文 when key
 */
const formatingWhenKey = 'formatFilesByIgnores.formating';

/**
 * 格式特定文件夹
 */
export default class FormatFolderCmd extends ICmd {

  /**
   * 临时文档
   * 
   * 供用户检查即将被格式化的文档列表 
   */
  private formatFilesTmpDoc?: TextDocument;

  /**
   * 选择工作空间文件夹
   * @returns 
   */
  async selectWorkspaceFolderUri() {
    const wfs = await showSelectWorkspaceFolderPick({
      title: 'Select the workspace that needs to be formatted',
      ignoreFocusOut: true,
      placeHolder: 'Select workspace',
      esc: 'Select workspace cancelled'
    });

    if (wfs === undefined) {
      // 取消
      throw new ECancelAborted('Workspace not open');
    }

    return wfs.uri;
  }

  /**
   * 通过 ignore 配置过滤文件夹
   * @param folder 目标文件夹
   * @returns 
   */
  async filterFolder(folder: Uri): Promise<string[]> {

    /**
     * 通过文件夹路径获取 ignore 规则
     * @param pUri 文件夹路径
     * @param lExt 扩展规则(在所有文件规则之前,优先级最低)
     * @returns 
     */
    async function initIgnore(pUri: Uri, lExt: string[]) {
      const filter = ignore({ allowRelativePaths: true }).add(lExt);

      // 获取文件夹下的过滤规则
      for (const ignoreFile of Config.get.ignoreFileNames.map(i => Uri.joinPath(pUri, i))) {
        if (!await fsUtil.isExists(ignoreFile)) {
          continue;
        }
        log.debug('Find ignore file:', ignoreFile);
        filter.add(await fsUtil.readFile(ignoreFile, 'utf-8'));
      }

      return filter;
    }

    // 进度条控制
    let progress: TaskProgress = null!;
    // 取消令牌
    let token: CancellationToken = null!;

    /**
       * 递归过滤文档
       * @param p 文档路径
       * @param lExt 扩展过滤规则
       * @returns 
       */
    async function loopFilter(p: string[], lExt: string[]): Promise<string[]> {
      if (token.isCancellationRequested) {
        // 取消搜索
        throw new ECancelAborted('Format cancelled');
      }

      const res: string[] = [];

      const pUri = Uri.joinPath(folder, ...p);

      if (!await fsUtil.isExists(pUri)) {
        log.error('Folder not exists:', pUri);
        return res;
      }

      const filter = await initIgnore(pUri, lExt);

      const files = [];

      for (const [name, fileType] of await fsUtil.readDirectory(pUri)) {
        const file = p.concat(name).join('/');

        progress.report({ message: file });

        // 判断文档是否存在
        const fileUri = Uri.joinPath(folder, file);
        if (!await fsUtil.isExists(fileUri)) {
          log.error('Document not exists:', fileUri);
          continue;
        }

        if (fileType === FileType.Directory && !filter.ignores(name + '/')) {
          // 子目录
          const children = (await loopFilter(p.concat(name), []))
            .map(f => name + '/' + f);
          files.push(...children);
          continue;
        }

        if (fileType === FileType.File && !filter.ignores(name)) {
          files.push(name);
        }
      }

      return res.concat(filter.filter(files));
    }

    return await window.withProgress<string[]>(
      {
        cancellable: true,
        location: ProgressLocation.Notification,
        title: 'Filter files by ignores'
      },
      async (p: TaskProgress, t: CancellationToken) => {
        progress = p, token = t;

        const lExt = Config.get.useIgnoreExtension
          ? Config.get.ignoreExtension
          : [];

        return await loopFilter([], lExt);
      }
    );
  }

  /**
   * 格式化文档
   * @param folder 文档根目录
   * @param docs 文档列表
   */
  async formatDocs(folder: Uri, docs: string[]) {
    // 进度
    const increment = (1 / docs.length) * 100;

    /**
     * 格式化任务
     * @param progress 进度条配置
     * @param token 取消令牌
     */
    async function formatTask(progress: TaskProgress, token: CancellationToken) {
      for (let index = 0; index < docs.length; index++) {
        if (token.isCancellationRequested) {
          // 取消
          throw new ECancelAborted('Format cancelled');
        }

        const doc = Uri.joinPath(folder, docs[index]);

        log.debug('Format:', doc);

        progress.report({
          message: `(${index}/${docs.length}) ${pathUtil.basename(doc)}`,
          increment
        });

        const formatStat = await docUtil.formatDocument(doc, Config.get.organizeImports);
        const level = formatStat ? LogLevel.Info : LogLevel.Error;
        log.print(level, formatStat ? 'Success:' : 'Fail:', doc);
      }
      progress.report({ increment: 100 });
    }

    await window.withProgress(
      {
        cancellable: true,
        location: ProgressLocation.Notification,
        title: 'Formatting documents'
      },
      formatTask
    );
  }

  /**
   * 格式化前用户确认
   * @param folder 待格式化的文件夹
   */
  async confirmStartFormat(folder: Uri) {
    const res = await showConfirmPick({
      sure: 'Start Format',
      cancel: 'Cancel',
      title: `Start format workspace (${pathUtil.basename(folder)}) files?`,
      ignoreFocusOut: true,
      placeHolder: 'Please check file list',
      esc: 'Format cancelled'
    });

    if (!res) {
      // 取消
      throw new ECancelAborted('Format cancelled');
    }
  }

  /**
   * 关闭临时文档
   */
  async closeFormatFilesTmpDoc() {
    try {
      if (this.formatFilesTmpDoc) {
        // 清空内容
        await docUtil.updateDocument(this.formatFilesTmpDoc, '');
        // 关闭文档
        await docUtil.closeDocument(this.formatFilesTmpDoc);
        this.formatFilesTmpDoc = undefined;
      }
      // eslint-disable-next-line no-empty
    } catch (_) { }
  }

  async finally() {
    // 恢复上下文变量(标识格式化完成)
    await commands.executeCommand('setContext', formatingWhenKey, false);
    await this.closeFormatFilesTmpDoc();
  }

  /**
   * 显示需要格式化的文档的统计信息
   * @param folder 文件夹
   * @param docs 文档
   */
  async showDocsStat(folder: Uri, docs: string[]) {
    const docUris = docs.map(f => Uri.joinPath(folder, f));
    const { count: docCount, ext: docExt } = docUtil.statDocuments(docUris);

    const extLines = [];

    // 扩展名最大长度
    const extNameMaxLength = listUtil.maxLength(Object.keys(docExt));
    // 扩展统计数最大长度
    const extCountMaxLength = listUtil.maxLength(Object.values(docExt));

    // 扩展分组显示
    const extLineCount = 4;
    // [...10] == 3 => [[...3],[...3],[...3],[...1]]
    for (const group of listUtil.group(Object.entries(docExt), extLineCount)) {
      extLines.push(
        group.map(([key, count]) => {
          // 名称后补充
          const k = key.padEnd(extNameMaxLength, ' ');
          // 总数前补充
          const c = count.toString().padStart(extCountMaxLength + 1, ' ');
          return k + c;
        }).join(' | ')
      );
    }
    const tmpTitleLines = tmpTitle.split('\n');

    // 所有行最大长度
    const lineMaxLength = listUtil.maxLength(tmpTitleLines.concat(docs).concat(extLines));

    // 分割线
    const lineHead = ''.padEnd(lineMaxLength, '=');
    const lineBody = ''.padEnd(lineMaxLength, '-');

    const lines: string[] = [
      // 文档顶部banner占位信息(变相解决确认框遮挡问题)
      ...tmpTitleLines,
      lineHead,
      'Format files (please check):',
      lineHead,
      'Count: ' + docCount,
      'Type:',
      ...extLines,
      lineBody,
      ...docs,
      lineBody
    ];

    lines.forEach(l => log.info(l));

    // 创建临时文档供用户检查
    this.formatFilesTmpDoc = await docUtil.createDocument(lines.join('\n'));
  }

  async run(uri: Uri) {
    // 标识格式化进行中, 搭配 when 防止重入
    await commands.executeCommand('setContext', formatingWhenKey, true);
    // 工作空间存在多个文件夹时根目录右键选择异常 {}
    // 修正为：让用户自行选择工作空间文件夹
    const folder = Object.keys(uri).length === 0
      ? await this.selectWorkspaceFolderUri()
      : uri;

    log.debug('Format folder root:', folder);

    // 筛选全部需要格式化的文件
    const docs = await this.filterFolder(folder);

    // 未搜索到文件
    if (docs.length == 0) {
      return msg.showInformationMessage('No match files: nothing to do');
    }

    // 显示文档统计信息
    await this.showDocsStat(folder, docs);

    // 用户确认
    await this.confirmStartFormat(folder);

    // 关闭临时文档
    await this.closeFormatFilesTmpDoc();

    try {
      // 开始格式化
      await this.formatDocs(folder, docs);
    } finally {
      if (Config.get.collapseExplorerFolders) {
        // 收起文件夹
        await commands.executeCommand('workbench.files.action.collapseExplorerFolders');
      }
      // 关闭已保存的编辑器
      // workbench.action.closeUnmodifiedEditors
    }

    msg.showInformationMessage('Format files completed');
  }

  async deactivate() {
    await super.deactivate();
    await this.finally();
  }
}