/**
 * 获取列表最大长度(字符串,数字)
 * @param list 列表
 * @returns 
 */
function maxLength(list: (string | number)[]) {
  return Math.max(...list.map(s => (s + '').length));
}

/**
 * 列表分组
 * @param list 列表
 * @param itemMax 每组最大数
 * @returns 
 */
function group<T>(list: T[], itemMax: number): T[][] {
  return list.reduce((acc, curr, index) => {
    if (index % itemMax === 0) acc.push([]);
    acc[Math.floor(index / itemMax)].push(curr);
    return acc;
  }, [] as T[][]);
}

export default {
  maxLength,
  group
};