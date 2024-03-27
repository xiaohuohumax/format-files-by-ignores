import showEscPick, { EscPickOptions } from './showEscPick';

export interface ConfirmOptions extends EscPickOptions {
  /**
   * 确定
   */
  sure: string
  /**
   * 取消
   */
  cancel: string
}

/**
 * 通用确认框
 * @param options 配置信息
 * @returns 
 */
export default async function showConfirmPick(options: ConfirmOptions): Promise<boolean> {
  const result = await showEscPick([options.sure, options.cancel], options);
  return result === options.sure;
}