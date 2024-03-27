import log from '@/log';
import { window } from 'vscode';

function showInformationMessage(msg: string, ...items: string[]) {
  window.showInformationMessage(msg, ...items);
  log.info(msg);
}

function showErrorMessage(msg: string, ...items: string[]) {
  window.showErrorMessage(msg, ...items);
  log.error(msg);
}

function showWarningMessage(msg: string, ...items: string[]) {
  window.showWarningMessage(msg, ...items);
  log.warning(msg);
}

export default {
  showInformationMessage,
  showErrorMessage,
  showWarningMessage
};