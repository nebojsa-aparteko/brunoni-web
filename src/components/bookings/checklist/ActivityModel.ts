import {
  ActivityChangeType,
  ActivityLogUserData,
  ShortChecklistItem,
  ShortChecklistItemValueDocument,
  Stage,
} from './ChecklistItemModel';

export interface ActivityLogItem {
  id?: string;
  comment?: string;
  documents?: ShortChecklistItemValueDocument[] | null;
  checklistItem: ShortChecklistItem;
  stage?: Stage;
  by: ActivityLogUserData;
  at: Date;
  type: ActivityType;
  isInternal: boolean;
  changeType?: ActivityChangeType;
}

export enum ActivityType {
  COMMENT,
  ACTIVITY,
}
