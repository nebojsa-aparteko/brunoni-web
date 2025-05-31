import _ from 'lodash';
import isString from './isString';

// 'base' is initial and 'object' is the changed one
export const difference = (object: any, base: any) => {
  function changes(object: any, base: any) {
    return _.transform(object, function (result: any, value: any, key: any) {
      // ((typeof value === 'string' && value.match(/\s+/g)) && (typeof base[key] === 'string' && base[key].match(/\s+/g)))
      if (
        !_.isEqual(value, base[key]) &&
        (isString(base[key]) && base[key] === '' ? !(isString(value) && value === '') : true)
      ) {
        result[key] =
          _.isObject(value) && _.isObject(base[key]) ? changes(value, base[key]) : value;
      }
    });
  }
  return changes(object, base);
};
