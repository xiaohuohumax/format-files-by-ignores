import { ProgressLocation, Uri, ViewColumn, commands, window, workspace } from 'vscode';
import { OperationAborted } from '../error';
import { FormatConfig } from '../config';
import { Logger } from '../util/logger';
import { Message } from '../util/message';
import { Command } from "./command";
import ignore from 'ignore';
import fs from 'fs';
import path from 'path';

/**
 * 尝试打开文档
 * @param file 文档路径
 * @returns 
 */
export async function tryOpenDocument(file: Uri) {
    try {
        return await workspace.openTextDocument(file.fsPath);
    } catch (_) { }
}
/**
 * 利用 vscode 内置指令格式化文件
 * @param file 
 */
export async function formatFile(file: Uri): Promise<void> {
    const doc = await tryOpenDocument(file);
    if (doc) {
        await window.showTextDocument(doc, { preview: false, viewColumn: ViewColumn.One });
        await commands.executeCommand('editor.action.formatDocument');
        await commands.executeCommand('workbench.action.files.save');
        // todo 记录执行命令前文件状态, 已经打开的则不关闭
        await commands.executeCommand('workbench.action.closeActiveEditor');
    }
}

/**
 * 批量格式化文件
 * @param files 文件
 */
export async function formatFiles(files: Uri[]): Promise<void> {
    // 进度
    const increment = (1 / files.length) * 100;
    // 进度条
    await window.withProgress(
        {
            cancellable: true,
            location: ProgressLocation.Notification,
            title: 'Formatting documents'
        },
        async (progress, token) => {
            for (const file of files) {
                if (token.isCancellationRequested) {
                    // 中断取消
                    throw new OperationAborted('Format cancelled');
                }
                progress.report({ message: file.fsPath, increment });
                await formatFile(file);
            }
            progress.report({ increment: 100 });
        }
    );
}

/**
 * 通过 ignore 文件排除文件
 * @param root 当前目录
 * @param ext 根目录扩展 过滤规则
 * @param ignoreFileNames ignore 文件名称
 * @returns 
 */
function filterFolderByignore(root: string, ext: string[], ignoreFileNames: string[]): string[] {
    const res: string[] = [];

    const filter = ignore({ allowRelativePaths: true }).add(ext);

    // 获取过滤规则
    for (const ignoreFileName of ignoreFileNames) {
        const gitignore = path.resolve(root, ignoreFileName);
        if (fs.existsSync(gitignore)) {
            filter.add(fs.readFileSync(gitignore, 'utf-8'));
        }
    }

    // 前置文件夹过滤
    const files = filter.filter(fs.readdirSync(root));

    for (const file of files.map(f => path.join(root, f))) {
        const fileStat = fs.statSync(file);
        if (fileStat.isDirectory()) {
            // 递归遍历
            res.push(...filterFolderByignore(file, [], ignoreFileNames));
        } else {
            res.push(file);
        }
    }

    // 后置兜底过滤
    return filter.filter(res);
}

/**
 * 格式化文件夹
 */
export class FormatFolder extends Command {

    /**
     * 格式化开始前确认
     * @param folder 
     */
    private async confirmSartFormat(folder: string) {
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
        // 清空日志，打开输出面板
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
        await this.confirmSartFormat(folder.fsPath);

        // 开始格式化
        await formatFiles(files.map(Uri.file));
        Message.showInformationMessage('Format files completed');
    }
}