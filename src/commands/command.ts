import * as vscode from 'vscode';
import { Message } from '../util/message';
import { OperationAborted } from '../error';
import { Logger } from '../util/logger';
import { FormatConfig } from '../config';

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
  async callback(..._args: unknown[]): Promise<void> { }

  /**
   * 回调抛出异常时执行
   * @param error 异常
   */
  async catch(error: Error) {
    if (error instanceof OperationAborted) {
      Message.showWarningMessage(error.message);
      return;
    }
    vscode.window.showErrorMessage(error.message);
    Logger.error(error.stack ?? error.message);
  }

  async finally() { }

  /**
   * 注册指令
   * @param context 上下文
   */
  async activate(context: vscode.ExtensionContext) {
    Logger.debug('Register command:', this.options.key);

    const callback = async (...args: unknown[]) => {
      Logger.debug('Format config:', JSON.stringify(FormatConfig.config));
      Logger.debug('Command:', this.options.key, 'callback args:', args);
      try {
        return await this.callback(...args);
      } catch (error) {
        await this.catch(error as Error);
      } finally {
        this.finally();
      }
    };

    context.subscriptions.push(
      vscode.commands.registerCommand(this.options.key, callback)
    );
  }

  /**
   * 注销指令
   */
  async deactivate() {
    Logger.debug('Deactivate command:', this.options.key);
  }
}