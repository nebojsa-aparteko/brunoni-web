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
