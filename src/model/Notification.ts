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
  readId?: string;
}

export enum InfoType {
  PIN_NUMBER_RECEIVED = 'PIN_NUMBER_RECEIVED',
  SHIPPED_ON_BOARD = 'SHIPPED_ON_BOARD',
  FINAL_BL = 'FINAL_BL',
  BL_DRAFT_FOR_INSPECTION = 'BL_DRAFT_FOR_INSPECTION',
}

export enum InfoTypeDescription {
  PIN_NUMBER_RECEIVED = 'Please note the PIN number and relevant empty return information are available now.',
  SHIPPED_ON_BOARD = ' Your shipment has been successfully loaded on board.',
  FINAL_BL = 'Please find enclosed the final B/L copy for above mentioned shipment.',
  BL_DRAFT_FOR_INSPECTION = 'Please find enclosed BL draft for inspection. Kindly check and approve it on the checklist.',
}
