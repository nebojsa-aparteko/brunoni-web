export default interface Carrier {
  id: string;
  name: string;
  color: string;
  sideCharges?: SideCharges;
}

export interface SideCharges {
  validFrom: Date;
  contactEmailAddress: string;
  groups: Array<SideChargesStatementGroup>;
}

export interface SideChargesStatementGroup {
  prefix?: string;
  statements: Array<SideChargesStatement>;
}

export interface SideChargesStatement {
  label?: string;
  amount: string;
  currency: string;
  per: string;
}
