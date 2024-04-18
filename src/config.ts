import { workspace } from 'vscode';

export interface IConfig {
  /**
   * 添加是否开启忽略扩展
   */
  useIgnoreExtension: boolean
  /**
   * 忽略扩展(仅限根目录)
   */
  ignoreExtension: string[]
  /**
   * ignore 文件名称
   * 
   * 比如: .gitignore
   */
  ignoreFileNames: string[]
  /**
   * 格式化完成后是否折叠资源管理器文件夹
   */
  collapseExplorerFolders: boolean
  /**
   * 是否格式化 import 语句 (删除未使用参数, 按照规律排序)
   */
  organizeImports: boolean
  /**
   * 过滤并发数
   */
  filterConcurrency: number
}

/**
 * 用户配置信息
 */
export class Config {
  public static get get(): IConfig {
    return workspace.getConfiguration().get<IConfig>(
      'formatFilesByIgnores',
      {
        collapseExplorerFolders: true,
        useIgnoreExtension: true,
        ignoreExtension: [],
        ignoreFileNames: [],
        organizeImports: false,
        filterConcurrency: 16
      }
    );
  }
}