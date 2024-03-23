import { LogLevel, window } from "vscode";

export interface LoggerOptions {
    format: string
}

/**
 * 日志
 */
export class Logger {

    // ouput 显示名称
    public static readonly outputchannelName = 'Format Files By Ignores';

    // output 输出
    public static readonly outputChannel = window.createOutputChannel(Logger.outputchannelName);

    // 等级
    // todo 通过 env 获取
    public static logLevel: LogLevel = LogLevel.Debug;

    // 显示格式
    public static instance: Logger = new Logger({
        format: ':time :level: :msg'
    });

    constructor(private options: LoggerOptions) { }

    public info(msg: string) {
        this.log(LogLevel.Info, msg);
    }

    public debug(msg: string) {
        this.log(LogLevel.Debug, msg);
    }

    public warning(msg: string) {
        this.log(LogLevel.Warning, msg);
    }

    public error(msg: string) {
        this.log(LogLevel.Error, msg);
    }

    public log(level: LogLevel, msg: string) {
        if (Logger.logLevel > level || Logger.logLevel === LogLevel.Off) {
            return;
        }
        const replaces: [string, string][] = [
            [':time', new Date().toLocaleString()],
            [':msg', msg],
            [':level', LogLevel[level]]
        ];
        const line = replaces.reduce(
            (f, r) => f.replace(r[0], r[1]),
            this.options.format
        );
        Logger.outputChannel.appendLine(line);
    }

}