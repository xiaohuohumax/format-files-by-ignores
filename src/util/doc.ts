import { ProgressLocation, Uri, ViewColumn, commands, window, workspace } from 'vscode';
import { OperationAborted } from '../error';

/**
 * 尝试打开文档
 * @param doc 文档路径
 * @returns 
 */
export async function tryOpenDoc(doc: Uri) {
    try {
        return await workspace.openTextDocument(doc.fsPath);
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
export async function formatDocs(docs: Uri[]): Promise<void> {
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
            for (const file of docs) {
                if (token.isCancellationRequested) {
                    // 中断取消
                    throw new OperationAborted('Format cancelled');
                }
                progress.report({ message: file.fsPath, increment });
                await formatDoc(file);
            }
            progress.report({ increment: 100 });
        }
    );
}

