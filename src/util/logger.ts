import { LogLevel, window } from 'vscode';

/**
 * 日志
 */
export class Logger {

  public static readonly outputChannelName = import.meta.env.VITE_OUTPUT_CHANNEL_NAME;

  // output 输出
  private static readonly outputChannel = window.createOutputChannel(Logger.outputChannelName);

  // 日志级别
  public static logLevel: LogLevel = LogLevel[import.meta.env.VITE_LOG_LEVEL];

  public static info(msg: string) {
    Logger.log(LogLevel.Info, msg);
  }

  public static debug(msg: string) {
    Logger.log(LogLevel.Debug, msg);
  }

  public static warning(msg: string) {
    Logger.log(LogLevel.Warning, msg);
  }

  public static error(msg: string) {
    Logger.log(LogLevel.Error, msg);
  }

  public static log(level: LogLevel, msg: string) {
    if (Logger.logLevel > level || Logger.logLevel === LogLevel.Off) {
      return;
    }
    const replaces: [string, string][] = [
      [':time', new Date().toLocaleString()],
      [':msg', msg],
      [':level', LogLevel[level].padStart(6, ' ')]
    ];
    const line = replaces.reduce(
      (f, r) => f.replace(r[0], r[1]),
      import.meta.env.VITE_LOG_FORMAT
    );
    Logger.outputChannel.appendLine(line);
  }

  public static show(preserveFocus?: boolean) {
    Logger.outputChannel.show(preserveFocus);
  }

}