<div align="center">
  <img src="./icon.png" style="width:7em" />
  <p>
      <img alt="Downloads" src="https://img.shields.io/visual-studio-marketplace/d/xiaohuohumax.format-files-by-ignores">
      <img alt="Installs" src="https://img.shields.io/visual-studio-marketplace/i/xiaohuohumax.format-files-by-ignores">
    <img alt="License" src="https://img.shields.io/github/license/xiaohuohumax/format-files-by-ignores.svg"/>
    <img alt="Last Commit" src="https://img.shields.io/github/last-commit/xiaohuohumax/format-files-by-ignores.svg"/>
    <img alt="Stars" src="https://img.shields.io/github/stars/xiaohuohumax/format-files-by-ignores.svg"/>
  </p>
</div>

# Format Files By Ignore

[English](./README.md)

VSCode插件：依据 ignore 文件筛选文件，然后批量格式化文件（Format Files By Ignores）

**注意:** 格式文件时是调用 VSCode 的默认格式化（alt + shift + f），用户默认配置是啥就是啥。

## 安装

VSCode 插件搜索 `Format Files By Ignores`

![ext.png](./images/ext.png)

## 使用

+ 格式文件夹（folder）
    + 文件夹上 `右键`
    + 选择 `Start Format Folder By Ignores 📂`
+ 格式工作空间（workspace）
    + 调用命令面板 `ctrl + shift + p`
    + 搜索 `Start Format Workspace By Ignores 📂`
    + 选择需要批量格式的 `工作空间（workspace）`

## 配置

- `formatFilesByIgnores.ignoreExtension`: 文件夹根目录 `ignore` 过滤规则扩展
  - `default`: [ "node_modules", ".vscode", ".git", "dist" ]
- `formatFilesByIgnores.ignoreFileNames`: `Ignore` 文件的名称
  - `default`: [ ".gitignore" ]
  
## 演示

![folder.gif](./images/folder.gif)

![workspace.gif](./images/workspace.gif)

## 链接

- [Homepage](https://github.com/xiaohuohumax/format-files-by-ignores#readme)
- [Issue](https://github.com/xiaohuohumax/format-files-by-ignores/issues)
- [Marketplace](https://marketplace.visualstudio.com/items?itemName=xiaohuohumax.format-files-by-ignores)

## 最后

玩的开心 🎉🎉🎉🎉