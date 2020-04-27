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
  role: Role;
  lastSession: Date;
  teams: UserRecord[];
}

type Role = 'superadmin' | 'sales' | 'operations';

export const ADMIN_ROLES = ['superadmin', 'sales', 'operations'];
export const CUSTOMER_FACING_ROLES = ['superadmin', 'sales'];

export function isAdmin(userRecord: UserRecord) {
  return userRecord.role ? ADMIN_ROLES.includes(userRecord.role) : false;
}
