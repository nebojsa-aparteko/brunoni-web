export default (map: { [key: string]: any }) => (value: { [key: string]: any }) =>
  Object.entries(map).reduce((acc, [name, newName]) => ({ ...acc, [newName]: value[name] }), {});
