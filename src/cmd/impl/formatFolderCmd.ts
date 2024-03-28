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
import { CancellationToken, FileType, LogLevel, Progress, ProgressLocation, TextDocument, Uri, commands, l10n, window } from 'vscode';
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
   * 目标文件夹路径
   */
  private folder: Uri = null!;

  /**
   * 选择工作区文件夹
   * @returns 
   */
  async selectWorkspaceFolderUri() {
    const wfs = await showSelectWorkspaceFolderPick({
      title: l10n.t('Select the workspace that needs to be formatted'),
      ignoreFocusOut: true,
      placeHolder: l10n.t('Select workspace folder'),
      esc: l10n.t('Select workspace folder cancelled')
    });

    if (wfs === undefined) {
      // 取消
      throw new ECancelAborted(l10n.t('Workspace not open'));
    }

    return wfs.uri;
  }

  /**
   * 通过 ignore 配置过滤文件夹
   * @returns 
   */
  async filterFolder(): Promise<string[]> {

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
    const loopFilter = async (p: string[], lExt: string[]): Promise<string[]> => {
      if (token.isCancellationRequested) {
        // 取消搜索
        throw new ECancelAborted(l10n.t('Format cancelled'));
      }

      const res: string[] = [];

      const pUri = Uri.joinPath(this.folder, ...p);

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
        const fileUri = Uri.joinPath(this.folder, file);
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
    };

    return await window.withProgress<string[]>(
      {
        cancellable: true,
        location: ProgressLocation.Notification,
        title: l10n.t('Filter files by ignores')
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
   * @param docs 文档列表
   */
  async formatDocs(docs: string[]) {
    // 进度
    const increment = (1 / docs.length) * 100;

    /**
     * 格式化任务
     * @param progress 进度条配置
     * @param token 取消令牌
     */
    const formatTask = async (progress: TaskProgress, token: CancellationToken) => {
      for (let index = 0; index < docs.length; index++) {
        if (token.isCancellationRequested) {
          // 取消
          throw new ECancelAborted(l10n.t('Format cancelled'));
        }

        const doc = Uri.joinPath(this.folder, docs[index]);

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
    };

    await window.withProgress(
      {
        cancellable: true,
        location: ProgressLocation.Notification,
        title: l10n.t('Formatting documents')
      },
      formatTask
    );
  }

  /**
   * 格式化前用户确认
   */
  async confirmStartFormat() {
    const res = await showConfirmPick({
      sure: l10n.t('Start Format'),
      cancel: l10n.t('Cancel'),
      title: l10n.t('Start format workspace ({0}) files?', pathUtil.basename(this.folder)),
      ignoreFocusOut: true,
      placeHolder: l10n.t('Please check file list'),
      esc: l10n.t('Format cancelled')
    });

    if (!res) {
      // 取消
      throw new ECancelAborted(l10n.t('Format cancelled'));
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
   * @param docs 文档
   */
  async showDocsStat(docs: string[]) {
    const docUris = docs.map(f => Uri.joinPath(this.folder, f));
    const { count: docCount, ext: docExt } = docUtil.statDocuments(docUris);

    const statLines = [
      'Folder: ' + pathUtil.basename(this.folder),
      'Count: ' + docCount,
      'Type:',
    ];

    // 扩展名最大长度
    const extNameMaxLength = listUtil.maxLength(Object.keys(docExt));
    // 扩展统计数最大长度
    const extCountMaxLength = listUtil.maxLength(Object.values(docExt));

    // 扩展分组显示
    const extLineCount = 4;
    // [...10] == 3 => [[...3],[...3],[...3],[...1]]
    for (const group of listUtil.group(Object.entries(docExt), extLineCount)) {
      statLines.push(
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
    const lineMaxLength = listUtil.maxLength(tmpTitleLines.concat(docs).concat(statLines));

    // 分割线
    const lineHead = ''.padEnd(lineMaxLength, '=');
    const lineBody = ''.padEnd(lineMaxLength, '-');

    const lines: string[] = [
      // 文档顶部banner占位信息(变相解决确认框遮挡问题)
      ...tmpTitleLines,
      lineHead,
      l10n.t('Format files (please check):'),
      lineHead,
      ...statLines,
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
    // 工作区存在多个文件夹时根目录右键选择异常 {}
    // 修正为：让用户自行选择工作空间文件夹
    this.folder = Object.keys(uri).length === 0
      ? await this.selectWorkspaceFolderUri()
      : uri;

    log.debug('Format folder root:', this.folder);

    // 筛选全部需要格式化的文档
    const docs = await this.filterFolder();

    // 未搜索到文档
    if (docs.length == 0) {
      return msg.showInformationMessage(l10n.t('No match files: nothing to do'));
    }

    // 显示文档统计信息
    await this.showDocsStat(docs);

    // 用户确认
    await this.confirmStartFormat();

    // 关闭临时文档
    await this.closeFormatFilesTmpDoc();

    try {
      // 开始格式化
      await this.formatDocs(docs);
    } finally {
      if (Config.get.collapseExplorerFolders) {
        // 收起文件夹
        await commands.executeCommand('workbench.files.action.collapseExplorerFolders');
      }
      // 关闭已保存的编辑器
      // workbench.action.closeUnmodifiedEditors
    }

    msg.showInformationMessage(l10n.t('Format files completed'));
  }

  async deactivate() {
    await super.deactivate();
    await this.finally();
  }
}