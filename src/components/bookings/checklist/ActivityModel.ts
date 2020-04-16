import { ActivityLogUserData } from './ChecklistItemModel';

export interface CommentEntity {
  text: string;
  commentedBy: ActivityLogUserData;
  commentedAt: Date;
  type: ActivityType;
  isInternal: boolean;
}

export enum ActivityType {
  COMMENT,
  ACTIVITY,
}
