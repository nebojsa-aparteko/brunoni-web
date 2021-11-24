import Price from '../../Price';
import Entity from '../../Entity';

interface ProviderConfig extends Entity {
  type: ProviderConfigType;
}

export interface ProviderExtensionEntity extends Entity {
  name: string;
}

export interface OfferProviderConfig extends ProviderConfig {
  type: ProviderConfigType.OFFER;
  offerType: OfferProviderConfigType;
  extension: ProviderExtensionEntity;
  transportMode?: string;
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

export const isIncludedProviderProfitEntity = (value: OfferProviderConfig): value is IncludedOfferProviderConfig =>
  value.offerType === OfferProviderConfigType.INCLUDED;

export const isAddOnProviderProfitEntity = (value: OfferProviderConfig): value is AddOnOfferProviderConfig =>
  value.offerType === OfferProviderConfigType.ADD_ON;

export default ProviderConfig;
