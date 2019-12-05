import get from 'lodash/fp/get';
import set from 'lodash/fp/set';

export default (map: { [key: string]: any }) => (value: { [key: string]: any }) =>
  Object.entries(map).reduce((acc, [name, newName]) => set(newName, get(name)(value))(acc as any), {});
