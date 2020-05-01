import { Team } from './Teams';

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
  teams: Team[];
}

export type Role = 'superadmin' | 'sales' | 'operations';

export const ADMIN_ROLES = ['superadmin', 'sales', 'operations'];
export const CUSTOMER_FACING_ROLES = ['sales'];

export function isDashboardUser(userRecord?: UserRecord | null) {
  return isSuperAdmin(userRecord) || (userRecord?.role ? ADMIN_ROLES.includes(userRecord.role) : false);
}

export function isSuperAdmin(userRecord?: UserRecord | null) {
  return userRecord?.isAdmin;
}
