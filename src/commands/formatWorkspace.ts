import { FormatFolder } from './formatFolder';
import { selectWorkspace } from '../util/workspace';

/**
 * 格式化工作空间
 */
export class FilterWorkspace extends FormatFolder {

    async callback(): Promise<void> {
        const wp = await selectWorkspace();
        // 开始格式化
        await super.callback(wp.uri);
    }
}