import { Team } from './Teams';
import Client from './Client';

export const UserRecordMinProperties = ['alphacomClientId', 'alphacomId', 'firstName', 'lastName', 'emailAddress'];

export interface UserRecordMin {
  alphacomClientId?: string;
  alphacomId: string;
  firstName: string;
  lastName: string;
  emailAddress?: string;
}

export default interface UserRecord extends UserRecordMin {
  id?: string;
  company?: Client;
  isAdmin?: boolean;
  role?: Role;
  lastSession?: Date;
  teams?: Team[];
  archived?: boolean;
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
