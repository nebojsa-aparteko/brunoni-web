import { BookingCategory, BookingVersion } from './Booking';

export default interface EquipmentControl {
  bookingId: string;
  containerType: string;
  containerQuantity: number;
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

export interface EquipmentImportSummary {
  Arrived: CountedValue;
  'On Water': CountedValue;
  'Gate Out': CountedValue;
  Total: CountedValue;
  Today: CountedValue;
}

export type CountedValue = { [k: string]: number };
