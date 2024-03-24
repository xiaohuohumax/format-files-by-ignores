import { Uri, window } from 'vscode';
import { selectWorkspace } from '../util/workspace';
import { filterFolderByignore } from '../util/folder';
import { formatDocs } from '../util/doc';
import { OperationAborted } from '../error';
import { FormatConfig } from '../config';
import { Logger } from '../util/logger';
import { Message } from '../util/message';
import { Command } from "./command";
import path from 'path';

/**
 * 格式化文件夹
 */
export class FormatFolder extends Command {

    /**
     * 格式化开始前确认
     * @param folder 文件夹路径
     * @throws {OperationAborted} 取消中断
     */
    private async confirmStartFormat(folder: string) {
        const result = await window.showQuickPick([`Yes`, `No`], {
            title: `Start formatting workspace (${path.basename(folder)}) files?`,
            ignoreFocusOut: true,
            placeHolder: `Please check '${Logger.outputchannelName}' output for list of files`,
        });

        if (!result || result === 'No') {
            // 中断放弃
            throw new OperationAborted('Format cancelled');
        }
    }

    async callback(folder: Uri): Promise<void> {

        // 工作空间存在多个文件夹时根目录右键选择异常 {}
        // 修正为：让用户自行选择文件夹
        folder = (await selectWorkspace(folder)).uri;

        // 清空日志, 打开输出面板
        Logger.outputChannel.show(true);

        // 筛选全部需要格式化的文件
        const files = filterFolderByignore(
            folder.fsPath,
            // 全局扩展
            FormatConfig.config.ignoreExtension,
            // ignore 文件名称
            FormatConfig.config.ignoreFileNames
        );

        // 供用户检查
        Logger.instance.info('Format files:');
        files.forEach(files => Logger.instance.info(files));

        // 用户确认
        await this.confirmStartFormat(folder.fsPath);

        // 开始格式化
        await formatDocs(files.map(Uri.file));
        Message.showInformationMessage('Format files completed');
    }
}