export default (value: string, length: number) => {
  if (!length) return value;
  if (!value) return '-';
  if (value.length > length) {
    return value.substring(0, length) + '...';
  } else {
    return value;
  }
};
