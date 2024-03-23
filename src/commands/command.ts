import * as vscode from 'vscode';
import { Message } from '../util/message';
import { OperationAborted } from '../error';

/**
 * 配置
 */
export interface Options {
    /**
     * 注册 key
     */
    key: string
}

/**
 * 通用命令
 */
export abstract class Command {

    constructor(protected options: Options) { }

    /**
     * 命令回调
     * @param _args 任意回调参数
     */
    async callback(..._args: any[]): Promise<void> { }

    /**
     * 回调抛出异常时执行
     * @param error 异常
     */
    async catch(error: Error) {
        if (error instanceof OperationAborted) {
            Message.showWarningMessage(error.message);
        } else {
            Message.showErrorMessage(error.message);
        }
    }

    /**
     * 注册指令
     * @param context 上下文
     */
    async activate(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand(this.options.key, async (...args: any[]) => {
            try {
                return await this.callback(...args);
            } catch (error) {
                await this.catch(error as Error);
            }
        });
        context.subscriptions.push(disposable);
    }

    /**
     * 注销指令
     */
    async deactivate() { }
}