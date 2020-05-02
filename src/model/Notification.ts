import { ActivityLogUserData } from '../components/bookings/checklist/ChecklistItemModel';
import { MentionItem } from 'react-mentions';

export enum NotificationType {
  MENTIONED,
}

export default interface Notification {
  userEmail: string;
  at: Date;
  notification: NotificationType;
  by: ActivityLogUserData;
  comment: string;
  mentions: any;
  seen?: boolean;
  id?: string;
}
