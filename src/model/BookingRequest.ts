import Port from './Port';
import Carrier from './Carrier';
import Container from './Container';
import ContainerDetails from './ContainerDetails';

export interface BookingRequest {
  id?: string;
  origin?: Port;
  destination?: Port;
  carrier?: Carrier;
  quoteNumber?: number;
  customerReference?: string;
  containers?: any[];
  additionalInfo?: string;
  imo?: boolean;
  soc?: boolean;
  createdAt?: Date;
  createdBy?: any;
  status: BookingRequestStatus;
}

export enum BookingRequestStatus {
  REQUESTED = 'Requested',
  IN_PROGRESS = 'In Progress',
  CONFIRMED = 'Confirmed',
}
