export default interface UserRecord {
  alphacomClientId: string;
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
  isAdmin?: boolean;
  firstName: string;
  lastName: string;
  emailAddress: string;
}
