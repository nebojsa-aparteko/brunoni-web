import Payment from './Payment';

export default interface WeeklyPayment extends Payment {
  status: WeeklyPaymentStatus;
}

export enum WeeklyPaymentStatus {
  IN_PROGRESS = 'In Progress',
  BLOCKED = 'Approved',
  PAID = 'Paid',
}

export enum WeeklyPaymentApiAction {
  MOVE = 'Move',
  BLOCK = 'Block',
  UNBLOCK = 'Unblock',
}
