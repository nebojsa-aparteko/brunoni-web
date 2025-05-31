import Price from '../../Price';
import Entity from '../../Entity';
import { BookingCategory } from '../../Booking';
import { EquipmentControlContainerTypes } from '../../EquipmentControl';

interface ProviderConfig extends Entity {
  type: ProviderConfigType;
}

export interface ProviderExtensionEntity extends Entity {
  name: string;
}

export interface ProviderExtensionGroupEntity extends Entity {
  type: ProviderExtensionGroupType;
  transportMode?: string;
  category?: BookingCategory;
  country?: string;
  equipmentType?: keyof typeof EquipmentControlContainerTypes;
}

export enum ProviderExtensionGroupType {
  DEFAULT = 'DEFAULT',
  SPECIFIC = 'SPECIFIC',
}
export interface OfferProviderConfig extends ProviderConfig {
  type: ProviderConfigType.OFFER;
  offerType: OfferProviderConfigType;
  extension: ProviderExtensionEntity;
}

export interface IncludedOfferProviderConfig extends OfferProviderConfig {
  offerType: OfferProviderConfigType.INCLUDED;
}

export interface AddOnOfferProviderConfig extends OfferProviderConfig {
  offerType: OfferProviderConfigType.ADD_ON;
  price: Price;
}

export enum ProviderConfigType {
  OFFER = 'OFFER',
}
export enum OfferProviderConfigType {
  ADD_ON = 'ADD_ON',
  INCLUDED = 'INCLUDED',
  EXCLUDED = 'EXCLUDED',
}

export type ProviderExtension = Omit<ProviderExtensionEntity, 'id' | 'createdAt'>;
export type ProviderExtensionGroup = Omit<ProviderExtensionGroupEntity, 'id' | 'createdAt'>;

export const isIncludedProviderProfitEntity = (
  value: OfferProviderConfig,
): value is IncludedOfferProviderConfig => value.offerType === OfferProviderConfigType.INCLUDED;

export const isAddOnProviderProfitEntity = (
  value: OfferProviderConfig,
): value is AddOnOfferProviderConfig => value.offerType === OfferProviderConfigType.ADD_ON;

export default ProviderConfig;
