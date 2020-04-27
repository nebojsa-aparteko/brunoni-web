import UserRecord from './UserRecord';

export interface Team {
  id?: string;
  name?: string;
  users?: UserRecord[];
}
