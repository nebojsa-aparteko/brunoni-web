export default (obj: any) => {
  const ordered = Object.create(null);
  Object.keys(obj)
    .sort()
    .reverse()
    .forEach(key => {
      ordered[key] = obj[key];
    });

  return ordered;
};
