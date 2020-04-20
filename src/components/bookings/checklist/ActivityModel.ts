import {
  ActivityLogUserData,
  ChecklistItem,
  ChecklistItemValueDocument,
  ShortChecklistItem,
  ShortChecklistItemValueDocument,
  Stage,
} from './ChecklistItemModel';

export interface ActivityLogItem {
  comment?: string;
  documents?: ShortChecklistItemValueDocument[];
  checklistItem: ShortChecklistItem;
  stage?: Stage;
  by: ActivityLogUserData;
  at: Date;
  type: ActivityType;
  isInternal: boolean;
}

export enum ActivityType {
  COMMENT,
  ACTIVITY,
}
