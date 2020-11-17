const omitEmptyDeep = (obj: any) => {
  for (let prop in obj) {
    if (obj[prop] === null || obj[prop] === undefined) {
      delete obj[prop];
    } else if (typeof obj[prop] === 'object') {
      omitEmptyDeep(obj[prop]);
    }
  }
};

export default omitEmptyDeep;
