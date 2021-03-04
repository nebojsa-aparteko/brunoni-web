import { BookingCategory, BookingVersion } from './Booking';

export interface EquipmentSummary {
  bookingId: string;
  containerType: string;
  carrierId: string;
  locId: string;
  locTxt?: string;
  locDate?: string;
  status: string;
  category: BookingCategory;
  version: BookingVersion;
  blNumber: string;
  ETA: Date;
  ETS: Date;
}
