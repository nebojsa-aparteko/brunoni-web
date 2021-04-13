import Carrier from './Carrier';
import Port from './Port';

export default interface PaymentConfirmationRule {
  id: string;
  carrier: Carrier;
  contactTo: string[];
  contactCC: string[];
  port: Port;
  automaticMessage: boolean;
}
