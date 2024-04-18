# Format Files By Ignore

<p>
  <img alt="Downloads" src="https://img.shields.io/visual-studio-marketplace/d/xiaohuohumax.format-files-by-ignores">
  <img alt="Installs" src="https://img.shields.io/visual-studio-marketplace/i/xiaohuohumax.format-files-by-ignores">
  <img alt="License" src="https://img.shields.io/github/license/xiaohuohumax/format-files-by-ignores.svg"/>
  <img alt="Last Commit" src="https://img.shields.io/github/last-commit/xiaohuohumax/format-files-by-ignores.svg"/>
  <img alt="Stars" src="https://img.shields.io/github/stars/xiaohuohumax/format-files-by-ignores.svg"/>
</p>

[中文](./README_CN.md)

VSCode Extension: **Batch formatting files not filtered by the `ignore` configuration** 

## Install

VSCode Extensions Select `Format Files By Ignores`

## 📄 Usage

- **Format Workspace**
  - Open command pallette (`Ctrl + Shift + P`)
  - Enter `Start Format Workspace By Ignores 📂`
- **Format Folder**
  - `Right` click a folder
  - Select `Start Format Folder By Ignores 📂`
- **Custom Ignore File**
  - Create a file called `.formatignore` under the folder, and then write the ignore rules (like `.gitignore`)

## Practical tips (ignore rule)

### Exclude model
  
**For example:** Exclude all **svg** files

```txt
*.svg
```

### Include model

**For example:** Only include **ts** files

```txt
*
!src/**/
!src/**/*.ts
```

## ⚙ Options

- `formatFilesByIgnores.useignoreExtension`: Is use ignore extension ?
  - `default`: true
- `formatFilesByIgnores.ignoreExtension`: Ignore extension rules (root folder)
  - `default`: [ "node_modules", ".vscode", ".git", "dist" ]
- `formatFilesByIgnores.ignoreFileNames`: Ignore files name
  - `default`: [ ".gitignore", ".formatignore" ]
- `formatFilesByIgnores.collapseExplorerFolders`: Whether to collapse the explorer folder after formatting?
  - `default`: true
- `formatFilesByIgnores.filterConcurrency`: Filter concurrency
  - `default`: 16

## Ignore priority

```txt
ignoreExtension < ignoreFileNames

ignoreFileNames[1] < ignoreFileNames[2]
```

## 📹 Demo

![folder.gif](https://cdn.jsdelivr.net/gh/xiaohuohumax/format-files-by-ignores/images/folder_1_5_0.gif)

![workspace.gif](https://cdn.jsdelivr.net/gh/xiaohuohumax/format-files-by-ignores/images/workspace_1_5_0.gif)

![workspace.gif](https://cdn.jsdelivr.net/gh/xiaohuohumax/format-files-by-ignores/images/cancel_1_5_0.gif)

## 🔗 Link

- [Homepage](https://github.com/xiaohuohumax/format-files-by-ignores#readme)
- [Issue](https://github.com/xiaohuohumax/format-files-by-ignores/issues)
- [Marketplace](https://marketplace.visualstudio.com/items?itemName=xiaohuohumax.format-files-by-ignores)

## 🎉 Fin

Have fun 🎉🎉🎉🎉