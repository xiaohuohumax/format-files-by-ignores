import { FormatFolder } from './formatFolder';
import { selectWorkspace } from '../util/workspace';
import { Logger } from '../util/logger';

/**
 * 格式化工作空间
 */
export class FilterWorkspace extends FormatFolder {
  async callback(): Promise<void> {
    const wp = await selectWorkspace();
    Logger.debug('Format workspace root:', wp.uri);
    // 开始格式化
    await super.callback(wp.uri);
  }
}