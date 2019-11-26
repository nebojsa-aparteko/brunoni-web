import isArray from 'lodash/fp/isArray';

export default function asArray<T>(item: T[] | T | null | undefined): T[] {
  return item === null || item === undefined ? [] : isArray(item) ? item : [item];
}
