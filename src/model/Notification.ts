import { ActivityLogUserData } from '../components/bookings/checklist/ChecklistItemModel';
import { ActivityLogItem } from '../components/bookings/checklist/ActivityModel';
import { AlertType } from './Booking';
import { TaskType } from './Task';

export enum NotificationType {
  COMMENT,
  ACTIVITY,
  ALERT,
}

export default interface Notification {
  userAlphacomId: string;
  userEmail: string;
  at: Date;
  type: NotificationType;
  activity?: ActivityLogItem;
  referenceObject?: string;
  referenceID?: string;
  seen?: boolean;
  id?: string;
  alertType?: AlertType;
  taskType?: TaskType;
}
