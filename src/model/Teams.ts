import UserRecord from './UserRecord';
import Carrier from './Carrier';
import { BookingCategory } from './Booking';
import { TaskType } from './Task';

export enum TeamType {
  OPERATIONS = 'operations',
  ACCOUNTING = 'accounting',
}
export interface Team {
  id?: string;
  name?: string;
  users?: UserRecord[];
  carriers?: Carrier[];
  categories?: BookingCategory[];
  checklistItems?: string[];
  teamType?: TeamType;
  taskTypes?: TaskType[];
}
