/**
 * 中断
 */
export class EAborted extends Error { }

/**
 * Esc取消
 */
export class EEscAborted extends EAborted { }

/**
 * 取消
 */
export class ECancelAborted extends EAborted { }
