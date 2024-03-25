import { workspace } from 'vscode';

export interface Config {
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
}

/**
 * 全局配置
 */
export class FormatConfig {
  public static get config(): Config {
    return workspace.getConfiguration().get<Config>('formatFilesByIgnores', {
      collapseExplorerFolders: true,
      useIgnoreExtension: true,
      ignoreExtension: [],
      ignoreFileNames: []
    });
  }
}