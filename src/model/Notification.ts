import { ActivityLogUserData } from '../components/bookings/checklist/ChecklistItemModel';
import { ActivityLogItem } from '../components/bookings/checklist/ActivityModel';

export enum NotificationType {
  COMMENT,
  ACTIVITY,
  ALERT,
}

export default interface Notification {
  userId: string;
  userEmail: string;
  at: Date;
  type: NotificationType;
  activity?: ActivityLogItem;
  referenceObject?: string;
  referenceID?: string;
  seen?: boolean;
  id?: string;
}
