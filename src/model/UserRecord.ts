export default interface UserRecord {
  alphacomId: string;
  company: {
    id: string;
    name: string;
    nameSup?: string;
    poBox?: string;
    city: string;
    zip?: string;
    countryCode: string;
  };
}
