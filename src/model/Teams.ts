import UserRecord from './UserRecord';
import Carrier from './Carrier';
import { BookingCategory } from './Booking';

export interface Team {
  id?: string;
  name?: string;
  users?: UserRecord[];
  carriers?: Carrier[];
  categories?: BookingCategory[];
  checklistItems?: string[];
}
