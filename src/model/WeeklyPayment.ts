import Payment from './Payment';

export default interface WeeklyPayment extends Payment {
  status: WeeklyPaymentStatus;
}

export enum WeeklyPaymentStatus {
  IN_PROGRESS = 'In Progress',
  BLOCKED = 'Blocked',
  PAID = 'Paid',
}
export enum WeeklyPaymentStatusLabel {
  'In Progress' = 'In Progress',
  Blocked = 'Approved',
  Paid = 'Paid',
}

export enum WeeklyPaymentApiAction {
  MOVE = 'Move',
  BLOCK = 'Block',
  UNBLOCK = 'Unblock',
}
