import Carrier from './Carrier';
import Port from './Port';
import { BookingCategory } from './Booking';

interface PaymentConfirmation {
  type: PaymentConfirmationType;
  id: string;
  carrier: Carrier;
  automaticMessage: boolean;
}
export interface PaymentConfirmationRule extends PaymentConfirmation {
  contactTo: string[];
  contactCC: string[];
  port: Port;
  type: PaymentConfirmationType.PAYMENT_CONFIRMATION;
}

export interface ClientStatisticsRule extends PaymentConfirmation {
  contact: string[];
  category: BookingCategory;
  clients: any;
  clientStatistics: any;
  type: PaymentConfirmationType.CLIENT_STATISTICS;
}

export enum PaymentConfirmationType {
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  CLIENT_STATISTICS = 'CLIENT_STATISTICS',
}
