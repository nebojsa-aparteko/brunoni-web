import Payment from './Payment';

export default interface Commission extends Payment {
  status: CommissionStatus;
}

export enum CommissionStatus {
  INVOICED = 'Invoiced',
  PAID = 'Paid',
}
