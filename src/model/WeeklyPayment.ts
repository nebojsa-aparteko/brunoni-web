import { BookingCategory } from './Booking';

export default interface WeeklyPayment {
  id?: string;
  bookingId: string;
  recId: string;
  reference: string;
  blNumber: string;
  category: BookingCategory;
  vessel: string;
  carrier: string;
  currency: Currency;
  amount: number;
  debitCredit: DebitCredit;
  payDate: Date;
  status?: Status;
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  CHF = 'CHF',
}

export enum DebitCredit {
  DEBIT = 'Debit',
  CREDIT = 'Credit',
}

export enum Status {
  IN_PROGRESS = 'In Progress',
  APPROVED = 'Approved',
  PAID = 'Paid',
}
