import { BookingCategory } from './Booking';

export default interface BrunoniCodes {
  category: BookingCategory;
  days: string;
  depotLocations: string[];
  equipments: string[];
  id: string;
  lastUpdated: Date;
  ports: string[];
  text: string;
  validFrom: Date;
  carrierId: string;
  type: BrunoniCodesType;
}

export enum BrunoniCodesType {
  DEMURRAGE = 'DEMURRAGE',
  STORAGE = 'STORAGE',
  PLUGIN = 'PLUGIN',
}
