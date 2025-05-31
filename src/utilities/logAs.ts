export default (name: string) =>
  <T>(value: T) =>
    (console.debug(name, value) as any) || value;
