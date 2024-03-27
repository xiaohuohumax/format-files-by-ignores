import log from '@/log';
import FormatFolderCmd from './formatFolderCmd';

/**
 * 选择工作空间格式化
 */
export default class FormatWorkspaceCmd extends FormatFolderCmd {
  async run(): Promise<void> {
    const folder = await this.selectWorkspaceFolderUri();
    log.debug('Format workspace root:', folder);
    await super.run(folder);
  }
}