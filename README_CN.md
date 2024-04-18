# Format Files By Ignore

<p>
  <img alt="Downloads" src="https://img.shields.io/visual-studio-marketplace/d/xiaohuohumax.format-files-by-ignores">
  <img alt="Installs" src="https://img.shields.io/visual-studio-marketplace/i/xiaohuohumax.format-files-by-ignores">
  <img alt="License" src="https://img.shields.io/github/license/xiaohuohumax/format-files-by-ignores.svg"/>
  <img alt="Last Commit" src="https://img.shields.io/github/last-commit/xiaohuohumax/format-files-by-ignores.svg"/>
  <img alt="Stars" src="https://img.shields.io/github/stars/xiaohuohumax/format-files-by-ignores.svg"/>
</p>

[English](./README.md)

VSCode 扩展: **批量格式化未被 `ignore` 配置过滤的文件**

## 安装

VSCode 插件搜索 `Format Files By Ignores`

## 使用

+ **格式化选定文件夹（folder）**
    + 文件夹上 `右键`
    + 选择 `Start Format Folder By Ignores 📂` 或者 `通过 Ignore 配置格式化选定文件夹 📂`
+ **格式化工作区（workspace）**
    + 调用命令面板 `ctrl + shift + p`
    + 搜索 `Start Format Workspace By Ignores 📂` 或者 `通过 Ignore 配置格式化工作区 📂`
    + 选择需要格式化的 `工作区（workspace）`
+ **自定义ignore文件**
    + 文件夹下创建名叫 `.formatignore` 的文件, 接着写入过滤规则(规则和 `.gitignore` 相同)

## ignore 实用技巧

### 排除模式 (例如: 排除全部 **svg** 文件)

```txt
*.svg
```

### 包含模式 (例如: 只包含 **ts** 文件)

```txt
*
!src/**/
!src/**/*.ts
```

## 配置

- `formatFilesByIgnores.useignoreExtension`: 是否使用过滤规则扩展?
  - `default`: true
- `formatFilesByIgnores.ignoreExtension`: 文件夹根目录 `ignore` 过滤规则扩展
  - `default`: [ "node_modules", ".vscode", ".git", "dist" ]
- `formatFilesByIgnores.ignoreFileNames`: `Ignore` 文件的名称
  - `default`: [ ".gitignore", ".formatignore" ]
- `formatFilesByIgnores.collapseExplorerFolders`: 格式化完成后是否折叠资源管理器文件夹?
  - `default`: true
- `formatFilesByIgnores.filterConcurrency`: 过滤并发数
  - `default`: 16

## ignore 优先级

```txt
ignoreExtension < ignoreFileNames

ignoreFileNames[1] < ignoreFileNames[2]
```

## 演示

![folder.gif](https://cdn.jsdelivr.net/gh/xiaohuohumax/format-files-by-ignores/images/folder_1_5_0.gif)

![workspace.gif](https://cdn.jsdelivr.net/gh/xiaohuohumax/format-files-by-ignores/images/workspace_1_5_0.gif)

![workspace.gif](https://cdn.jsdelivr.net/gh/xiaohuohumax/format-files-by-ignores/images/cancel_1_5_0.gif)

## 链接

- [Homepage](https://github.com/xiaohuohumax/format-files-by-ignores#readme)
- [Issue](https://github.com/xiaohuohumax/format-files-by-ignores/issues)
- [Marketplace](https://marketplace.visualstudio.com/items?itemName=xiaohuohumax.format-files-by-ignores)

## 最后

玩的开心 🎉🎉🎉🎉
