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
  by: ActivityLogUserData;
  notification: NotificationType;
  activityLogItem?: ActivityLogItem;
  comment: string;
  referenceObject?: string;
  referenceID?: string;
  seen?: boolean;
  id?: string;
}
