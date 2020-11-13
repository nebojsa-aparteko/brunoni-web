import Payment from './Payment';

export default interface WeeklyPayment extends Payment {
  status: WeeklyPaymentStatus;
}

export enum WeeklyPaymentStatus {
  IN_PROGRESS = 'In Progress',
  APPROVED = 'Approved',
  PAID = 'Paid',
}
