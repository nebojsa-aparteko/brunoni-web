export interface ChecklistItemValueDocument {
  uploadedBy: ActivityLogUserData;
  uploadedAt: Date;
  url: string;
  name: string;
  storedName: string;
}

export interface ActivityLogUserData {
  firstName: string;
  lastName: string;
  emailAddress: string;
  alphacomClientId: string;
  alphacomId: string;
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
}

export enum ActivityText {
  CHECKED = ' has checked ',
  UNCHECKED = ' has unchecked ',
  ADD_FILE = ' has added file ',
  DELETE_FILE = ' has deleted file ',
  DONE_BY_CUSTOMER = ' has marked done ',
}
