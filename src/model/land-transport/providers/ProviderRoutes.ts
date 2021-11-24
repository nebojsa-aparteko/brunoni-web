import Price from '../../Price';
import firebase from 'firebase';
import Entity from '../../Entity';
import { EquipmentControlContainerTypes } from '../../EquipmentControl';
import { Currency } from '../../Payment';

interface ProviderRouteEntity extends Entity {
  id: string;
  type: ProviderRoutesType;
}

export interface AutomaticProviderRouteEntity extends ProviderRouteEntity {
  type: ProviderRoutesType.AUTOMATIC;
  version: string; //work as id
  addedAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
  active: boolean;
}

export type PriceRange = { max: Price; min: Price };
export const getPriceRangeText = (range: PriceRange) => {
  if (!range) return '-';
  if (range.min.value === range.max.value) return `${range.min.value} ${range.min.currency}`;
  return `${range.min.value} ${range.min.currency} - ${range.max.value} ${range.max.currency}`;
};

export interface ManualProviderRouteEntity extends ProviderRouteEntity {
  type: ProviderRoutesType.MANUAL;
  origin: string;
  destination: string;
  transportMode: string;
  priceRange: PriceRange;
  pricePerContainer: PricePerContainer;
  currency: Currency;
  active: boolean;
}

export type PricePerContainer = {
  [key in keyof typeof EquipmentControlContainerTypes]: Price;
};

export enum ProviderRoutesType {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}

export type ProviderRoute = Omit<ProviderRouteEntity, 'id' | 'createdAt'>;
export type ManualProviderRoute = Omit<ManualProviderRouteEntity, 'id' | 'createdAt'>;
export type AutomaticProviderRoute = Omit<AutomaticProviderRouteEntity, 'id' | 'createdAt'>;

export default ProviderRouteEntity;
