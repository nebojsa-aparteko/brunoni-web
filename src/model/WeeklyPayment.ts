import { BookingCategory } from './Booking';

export default interface WeeklyPayment {
  id?: string;
  Recid: string;
  Ref: string;
  File: string;
  Transport: BookingCategory;
  BL: string;
  Vessel: string;
  Carrier: string;
  PayDate: Date;
  Currency: Currency;
  Amount: number;
  DebitCredit: DebitCredit;
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
