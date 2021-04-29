//import { BookingCategory } from './Booking';
import Carrier from './Carrier';
import Client from './Client';
import Port from './Port';
import { BookingCategory } from './Booking';
import firebase from '../firebase';

interface PaymentConfirmation {
  type: PaymentConfirmationType;
  id: string;
  carrier: Carrier;
  automaticMessage: boolean;
  createdAt: firebase.firestore.Timestamp;
}
export interface CarrierSettingsRule extends PaymentConfirmation {
  contactTo: string[];
  contactCC: string[];
  port: Port;
  type: PaymentConfirmationType.CARRIER_SETTINGS;
}
export interface CustomerSettingsRule extends PaymentConfirmation {
  contact: string[];
  category: BookingCategory;
  client: Client;
  statisticClient: Client;
  type: PaymentConfirmationType.CUSTOMER_SETTINGS;
}

export enum PaymentConfirmationType {
  CARRIER_SETTINGS = 'CARRIER_SETTINGS',
  CUSTOMER_SETTINGS = 'CUSTOMER_SETTINGS',
}
export interface ImpExp {
  export: boolean;
  import: boolean;
}
