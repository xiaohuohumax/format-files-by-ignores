import FormatFolderCmd from './impl/formatFolderCmd';
import FormatWorkspaceFolderCmd from './impl/formatWorkspaceFolderCmd';

export default [
  new FormatFolderCmd({ key: 'formatFilesByIgnores.start.formatFolder' }),
  new FormatWorkspaceFolderCmd({ key: 'formatFilesByIgnores.start.formatWorkspace' })
];