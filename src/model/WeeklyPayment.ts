import Payment from './Payment';

export default interface WeeklyPayment extends Payment {
  status: WeeklyPaymentStatus;
  platformStatus?: WeeklyPaymentPlatformStatus;
}

export enum WeeklyPaymentStatus {
  IN_PROGRESS = 'In Progress',
  BLOCKED = 'Blocked',
  PAID = 'Paid',
}

export enum WeeklyPaymentPlatformStatus {
  CLEARED = 'Cleared',
  ON_HOLD = 'On Hold',
}

export enum WeeklyPaymentStatusLabel {
  'In Progress' = 'In Progress',
  Blocked = 'Approved',
  Paid = 'Paid',
  Cleared = 'Cleared',
  'On Hold' = 'On Hold',
}

export enum WeeklyPaymentApiAction {
  MOVE = 'Move',
  BLOCK = 'Block',
  UNBLOCK = 'Unblock',
}
