import Price from '../../Price';
import Entity from '../../Entity';
import { EquipmentControlContainerTypes } from '../../EquipmentControl';
import { Currency } from '../../Payment';
import Destination from '../Destination';

interface ProviderRouteEntity extends Entity {
  id: string;
  type: ProviderRoutesType;
}

export interface RouteValidity {
  startDate: Date;
  endDate: Date;
}

export interface AutomaticProviderRouteEntity extends ProviderRouteEntity {
  type: ProviderRoutesType.AUTOMATIC;
  version: string; //work as id
  updatedAt: Date;
  validity: RouteValidity | null;
  description: string;
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

export interface SemiAutomaticProviderRouteEntity extends ProviderRouteEntity {
  type: ProviderRoutesType.SEMI_AUTOMATIC;
  origin: Destination;
  transportMode: string;
  active: boolean;
}

export type PricePerContainer = {
  [key in keyof typeof EquipmentControlContainerTypes]: Price;
};

export enum ProviderRoutesType {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
  SEMI_AUTOMATIC = 'SEMI_AUTOMATIC',
}

export type ProviderRoute = Omit<ProviderRouteEntity, 'id' | 'createdAt'>;
export type ManualProviderRoute = Omit<ManualProviderRouteEntity, 'id' | 'createdAt'>;
export type AutomaticProviderRoute = Omit<AutomaticProviderRouteEntity, 'id'>;
export type SemiAutomaticProviderRoute = Omit<SemiAutomaticProviderRouteEntity, 'id' | 'createdAt'>;

export default ProviderRouteEntity;
