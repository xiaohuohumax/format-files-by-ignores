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

  public static info(...msgs: unknown[]) {
    Logger.print(LogLevel.Info, ...msgs);
  }

  public static debug(...msgs: unknown[]) {
    Logger.print(LogLevel.Debug, ...msgs);
  }

  public static warning(...msgs: unknown[]) {
    Logger.print(LogLevel.Warning, ...msgs);
  }

  public static error(...msgs: unknown[]) {
    Logger.print(LogLevel.Error, ...msgs);
  }

  public static log(level: LogLevel, ...msgs: unknown[]) {
    Logger.print(level, ...msgs);
  }

  private static print(level: LogLevel, ...msgs: unknown[]) {
    if (Logger.logLevel > level || Logger.logLevel === LogLevel.Off) {
      return;
    }

    // 简单获取调用信息
    let caller = '';
    const stack = new Error().stack;
    if (stack) {
      caller = stack.split('\n')[3]?.replace(/\s*at\s*/i, '');
    }

    const replaces: [string, string][] = [
      // 时间
      [':time', new Date().toLocaleString()],
      // 消息主体
      [':msg', msgs.join(' ')],
      // 日志等级
      [':level', LogLevel[level].padStart(7, ' ')],
      // 调用者信息
      [':caller', caller],
    ];

    const line = replaces.reduce(
      (f, [key, value]) => f.replace(key, value),
      import.meta.env.VITE_LOG_FORMAT
    );

    Logger.outputChannel.appendLine(line);
  }

  private static stack() {

  }

  public static show(preserveFocus?: boolean) {
    Logger.outputChannel.show(preserveFocus);
  }

}