import FormatFolderCmd from './impl/formatFolderCmd';
import FormatWorkspaceCmd from './impl/formatWorkspaceCmd';

export default [
  new FormatFolderCmd({ key: 'formatFilesByIgnores.start.formatFolder' }),
  new FormatWorkspaceCmd({ key: 'formatFilesByIgnores.start.formatWorkspace' })
];