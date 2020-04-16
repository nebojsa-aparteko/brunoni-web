import { ActivityLogUserData, ChecklistItemValueDocument } from './ChecklistItemModel';

export interface ActivityLogItem {
  comment?: string;
  documents?: ChecklistItemValueDocument[];
  checklistItemReferenceId?: string;
  by: ActivityLogUserData;
  at: Date;
  type: ActivityType;
  isInternal: boolean;
}

export enum ActivityType {
  COMMENT,
  ACTIVITY,
}
