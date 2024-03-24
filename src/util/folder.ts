import ignore from 'ignore';
import fs from 'fs';
import path from 'path';
import { Logger } from './logger';

/**
 * 通过 ignore 文件排除文件
 * @param root 当前目录
 * @param ext 根目录扩展 过滤规则
 * @param ignoreFileNames ignore 文件名称
 * @returns 
 */
export function filterFolderByignore(root: string, ext: string[], ignoreFileNames: string[]): string[] {
    const res: string[] = [];

    if (!fs.existsSync(root)) {
        return res;
    }

    const filter = ignore({ allowRelativePaths: true }).add(ext);

    // 获取过滤规则
    for (const ignoreFileName of ignoreFileNames) {
        const ignoreFile = path.resolve(root, ignoreFileName);
        if (fs.existsSync(ignoreFile)) {
            filter.add(fs.readFileSync(ignoreFile, 'utf-8'));
        }
    }

    // 前置文件夹过滤
    const files = filter.filter(fs.readdirSync(root));

    for (const file of files.map(f => path.join(root, f))) {
        // 文件可能不存在异常
        if (!fs.existsSync(file)) {
            continue;
        }
        const fileStat = fs.statSync(file);
        if (fileStat.isDirectory()) {
            // 递归遍历
            res.push(...filterFolderByignore(file, [], ignoreFileNames));
        } else {
            res.push(file);
        }
    }

    // 后置兜底过滤
    return filter.filter(res);
}