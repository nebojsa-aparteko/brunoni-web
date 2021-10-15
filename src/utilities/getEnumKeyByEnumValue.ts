export default function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  myEnum: T,
  enumValue: string,
): keyof T | null {
  let keys = Object.keys(myEnum).filter(x => myEnum[x] === enumValue);
  return keys.length > 0 ? keys[0] : null;
}

export function getEnumValueByEnumKey<T extends { [index: string]: string }>(myEnum: T, enumKey: string) {
  return myEnum[enumKey];
}
