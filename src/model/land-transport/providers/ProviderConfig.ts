import Price from '../../Price';
import Entity from '../../Entity';

interface ProviderConfig {
  type: ProviderConfigType;
}

export interface ProviderExtensionEntity extends Entity {
  name: string;
}

export interface OfferProviderConfig extends ProviderConfig {
  offerType: OfferProviderConfigType;
  name: string;
}

export interface IncludedOfferProviderConfig extends OfferProviderConfig {
  offerType: OfferProviderConfigType.INCLUDED;
}

/*
  We separate ExcludedOfferProviderConfig and AddOnOfferProviderConfig because maybe we will have different fields in future
 */
export interface ExcludedOfferProviderConfig extends OfferProviderConfig {
  offerType: OfferProviderConfigType.EXCLUDED;
  price: Price;
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

export default ProviderConfig;
