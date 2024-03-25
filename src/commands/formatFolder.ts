import { Uri, WorkspaceFolder, commands, window, workspace } from 'vscode';
import { switchWorkspaceFolder } from '../util/workspace';
import { filterFolderByignore } from '../util/folder';
import { formatDocs, statDoc } from '../util/doc';
import { OperationAborted } from '../error';
import { FormatConfig } from '../config';
import { Logger } from '../util/logger';
import { Message } from '../util/message';
import { Command } from './command';
import path from 'path';

/**
 * 格式化文件夹
 */
export class FormatFolder extends Command {

  private folder: Uri = null!;
  private workspace?: WorkspaceFolder;

  /**
   * 格式化开始前确认
   * @param folder 文件夹路径
   * @throws {OperationAborted} 取消中断
   */
  private async confirmStartFormat() {
    const result = await window.showQuickPick(['Yes', 'No'], {
      title: `Start formatting workspace (${path.basename(this.folder.fsPath)}) files?`,
      ignoreFocusOut: true,
      placeHolder: `Please check '${Logger.outputChannelName}' output for list of files`,
    });

    if (!result || result === 'No') {
      // 中断放弃
      throw new OperationAborted('Format cancelled');
    }
  }

  private printStat(docs: Uri[]) {
    // 供用户检查
    const base = this.workspace?.uri.fsPath;
    const files = docs.map(d => path.relative(base ?? '', d.fsPath));
    const maxLength = Math.max(...files.map(f => f.length), 60);

    // 全部文件
    Logger.info(''.padEnd(maxLength, '='));
    Logger.info('Format files (please check):');
    Logger.info(''.padEnd(maxLength, '-'));
    files.forEach(f => Logger.info(f));
    Logger.info(''.padEnd(maxLength, '-'));

    // 统计
    const { count, ext } = statDoc(docs);
    Logger.info('Count:', count);
    Logger.info('Ext:', ...Object.entries(ext).map(([ext, count]) => `${ext}:${count}`));
    Logger.info(''.padEnd(maxLength, '='));
  }

  async callback(f: Uri) {
    this.folder = f;
    Logger.debug('Format folder root:', this.folder);

    // 工作空间存在多个文件夹时根目录右键选择异常 {}
    // 修正为：让用户自行选择工作空间文件夹
    if (Object.keys(this.folder).length === 0) {
      this.workspace = await switchWorkspaceFolder();
      this.folder = this.workspace.uri;
    } else {
      this.workspace = workspace.getWorkspaceFolder(this.folder);
    }

    // 打开输出面板
    Logger.show(true);

    const extensions: string[] = [];

    if (FormatConfig.config.useIgnoreExtension) {
      extensions.push(...FormatConfig.config.ignoreExtension);
    }

    // 筛选全部需要格式化的文件
    const docs = filterFolderByignore(
      this.folder.fsPath,
      // 全局扩展
      extensions,
      // ignore 文件名称
      FormatConfig.config.ignoreFileNames
    ).map(Uri.file);

    // 显示文档统计信息
    this.printStat(docs);

    // 未搜索到文件
    if (docs.length == 0) {
      return Message.showWarningMessage('Nothing to do');
    }

    // 用户确认
    await this.confirmStartFormat();

    try {
      // 开始格式化
      await formatDocs(docs);
    } finally {
      if (FormatConfig.config.collapseExplorerFolders) {
        // 收起文件夹
        await commands.executeCommand('workbench.files.action.collapseExplorerFolders');
      }
    }
    Message.showInformationMessage('Format files completed');
  }
}