export const detectAndInsertLink = (content: string) => {
  const reg = new RegExp(/(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-|~)+)/g);
  return content.replace(reg, "<a href='$1$2'>$1$2</a>");
};
