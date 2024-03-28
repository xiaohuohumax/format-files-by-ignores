import log from '@/log';
import FormatFolderCmd from './formatFolderCmd';

/**
 * 选择工作区文件夹格式化
 */
export default class FormatWorkspaceFolderCmd extends FormatFolderCmd {
  async run(): Promise<void> {
    const folder = await this.selectWorkspaceFolderUri();
    log.debug('Format workspace root:', folder);
    await super.run(folder);
  }
}