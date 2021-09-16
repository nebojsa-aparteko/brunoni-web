import isArray from 'lodash/fp/isArray';

export default function asArray<T>(item: T[] | T | null | undefined): T[] {
  return item === null || item === undefined ? [] : isArray(item) ? item : [item];
}

export function arrayMove(arr: any[], fromIndex: number, toIndex: number) {
  let element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}
