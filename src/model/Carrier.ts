export default interface Carrier {
  id: string;
  name: string;
  color: string;
  disabled: boolean;
  sideCharges?: SideCharges;
}

export interface SideCharges {
  validFrom: Date;
  contactEmailAddress: string;
  importCharges: SideCharge[];
  exportCharges: SideCharge[];
}

export interface SideCharge {
  columns: Array<string>;
  rows: Array<{ values: string[] }>;
}
