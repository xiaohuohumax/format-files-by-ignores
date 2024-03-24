import * as vscode from 'vscode';
import { Logger } from './util/logger';
import { Command } from './commands/command';
import { FormatFolder } from './commands/formatFolder';
import { FilterWorkspace } from './commands/formatWorkspace';

const commands: Command[] = [
  // 文件夹格式化
  new FormatFolder({
    key: 'formatFilesByIgnores.start.formatFolder'
  }),
  // 工作空间格式化
  new FilterWorkspace({
    key: 'formatFilesByIgnores.start.formatWorkspace'
  })
];

export function activate(context: vscode.ExtensionContext) {
  Logger.debug('activate');
  // 注册命令
  commands.forEach(c => c.activate(context));
}

export function deactivate() {
  Logger.debug('deactivate');
  commands.forEach(c => c.deactivate());
}
