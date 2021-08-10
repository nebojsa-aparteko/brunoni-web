const omitEmptyDeep = (obj: any) => {
  for (let prop in obj) {
    if (obj[prop] === null || obj[prop] === undefined) {
      delete obj[prop];
    } else if (typeof obj[prop] === 'object') {
      omitEmptyDeep(obj[prop]);
    }
  }
};

export const removeEmptyDeep = (obj: any) => {
  let finalObj = {} as any;
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') {
      const nestedObj = removeEmptyDeep(obj[key]);
      if (Object.keys(nestedObj).length) {
        finalObj[key] = nestedObj;
      }
    } else if (obj[key] !== '' && obj[key] !== undefined && obj[key] !== null) {
      finalObj[key] = obj[key];
    }
  });
  return finalObj;
};

export default omitEmptyDeep;
