import { ActivityLogItem } from '../components/bookings/checklist/ActivityModel';
import { AlertType } from './Booking';
import { TaskType } from './Task';
import { UserRecordMin } from './UserRecord';

export enum NotificationType {
  COMMENT,
  ACTIVITY,
  ALERT,
  TASK,
  INFO,
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
  createdTaskType?: TaskType;
  readForAllBy: UserRecordMin;
  infoType?: InfoType;
}

export enum InfoType {
  PIN_NUMBER_RECEIVED = 'PIN_NUMBER_RECEIVED',
}

export enum InfoTypeDescription {
  PIN_NUMBER_RECEIVED = 'Please note the PIN number and relevant empty return information are available now.',
}
