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
  year: number;
  containers: CountedValue;
}

export type CountedValue = { [k: string]: { [key: string]: string; count: string } };

export enum ImportEquipmentControlStatus {
  'On Water' = 'ON WATER',
  Arrived = 'ARRIVED',
  'Gate Out' = 'GATE OUT',
  Total = 'TOTAL',
}

export enum EquipmentControlContainerTypes {
  '22G1' = '20DC',
  '42G1' = '40DC',
  '45G1' = '40HC',
  '22R1' = '20RF',
  '45R1' = '40RH',
  '22U1' = '20OT',
  '42U1' = '40OT',
  '45U1' = '40OH',
}

export const statusKeys = Object.keys(ImportEquipmentControlStatus);
export const statusLabels = Object.values(ImportEquipmentControlStatus);

export const containerTypesValues = Object.keys(EquipmentControlContainerTypes);
export const containerTypesLabels = Object.values(EquipmentControlContainerTypes);

export const weeksColumns = ['Week 1', 'Week 2', 'Week 3', 'Export Total'];
