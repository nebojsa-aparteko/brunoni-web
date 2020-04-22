export interface ChecklistItemValueDocument {
  uploadedBy: ActivityLogUserData;
  uploadedAt: Date;
  url: string;
  name: string;
  storedName: string;
}

export interface ShortChecklistItemValueDocument {
  url: string;
  name: string;
}

export interface ActivityLogUserData {
  firstName: string;
  lastName: string;
  emailAddress: string;
  alphacomClientId: string;
  alphacomId: string;
}
export interface Stage {
  id: string;
  checked?: boolean;
  label: string;
  by?: ActivityLogUserData;
  at?: Date;
  order: number;
}
export interface ChecklistItem {
  id: string;
  label: string;
  order: number;
  checked?: boolean;
  confirmedByCustomer?: {
    by: ActivityLogUserData;
    at: Date;
  };
  values?: ChecklistItemValueDocument[];
  valuesAdmin?: ChecklistItemValueDocument[];
  stages: Stage[];
}

export interface ShortChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export enum ActivityText {
  CHECKED = ' has checked ',
  UNCHECKED = ' has unchecked ',
  ADD_FILE = ' has added file ',
  DELETE_FILE = ' has deleted file ',
  ADD_FILES = ' has added files ',
  DELETE_FILES = ' has deleted files ',
  DONE_BY_CUSTOMER = ' has marked done ',
}

export enum ActivityChangeType {
  CHECKED,
  ADD_FILE,
  DELETE_FILE,
  STAGE_CHECKED,
}
