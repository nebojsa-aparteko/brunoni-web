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

interface Summary {
  id?: string;
  locId: string;
  show: boolean;
}

export interface EquipmentImportSummary extends Summary {
  Arrived: CountedValue;
  'On Water': CountedValue;
  'Gate Out': CountedValue;
  Total: CountedValue;
  Today: CountedValue;
}

export interface EquipmentExportSummary extends Summary {
  week: number;
}

export type CountedValue = { [k: string]: number };
