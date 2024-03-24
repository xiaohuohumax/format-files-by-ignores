import { window } from 'vscode';
import { Logger } from './logger';

/**
 * 消息弹窗加日志打印
 */
export class Message {

  public static showInformationMessage(msg: string, ...items: string[]) {
    window.showInformationMessage(msg, ...items);
    Logger.info(msg);
  }

  public static showErrorMessage(msg: string, ...items: string[]) {
    window.showErrorMessage(msg, ...items);
    Logger.error(msg);
  }

  public static showWarningMessage(msg: string, ...items: string[]) {
    window.showWarningMessage(msg, ...items);
    Logger.warning(msg);
  }
}