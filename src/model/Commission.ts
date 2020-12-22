import { Currency, DebitCredit } from './Payment';
import { BookingCategory } from './Booking';

export default interface Commission {
  id?: string;
  bookingId: string;
  blNumber: string;
  category: BookingCategory;
  vessel: string;
  carrier: string;
  currency: Currency;
  amount: number;
  debitCredit: DebitCredit;
  payDate: Date;
  invDate: Date;
  dueDate: Date;
  status: CommissionStatus;
}

export enum CommissionStatus {
  INVOICED = 'Invoiced',
  PAID = 'Paid',
  OPEN = 'Open',
}
