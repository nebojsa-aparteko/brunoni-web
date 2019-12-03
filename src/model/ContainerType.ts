export default interface ContainerType {
  id: string;
  name: string;
  description: string;
  group: string;
  isRefrigerated: boolean | undefined;
  couldBeOversize: boolean | undefined;
}
