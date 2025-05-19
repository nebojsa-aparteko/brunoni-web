import type UserRecord from '../../model/UserRecord';

export interface ClientDetails {
  forwarder?: UserRecord;
  bkgRef?: string;
}

export interface BookingSummaryProps {
  editing: boolean;
}
