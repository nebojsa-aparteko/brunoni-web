import { BookingCategory } from '../../Booking';
import Entity from '../../Entity';
import { Currency } from '../../Payment';
import { PricePerContainer } from './ProviderRoutes';

interface ProviderProfitEntity extends Entity {
  type: ProviderProfitType;
  currency: Currency;
  pricePerContainer: PricePerContainer;
}
export enum ProviderProfitType {
  DEFAULT = 'DEFAULT',
  SPECIFIC = 'SPECIFIC',
}

export interface DefaultProviderProfitEntity extends ProviderProfitEntity {
  type: ProviderProfitType.DEFAULT;
}
export interface SpecificProviderProfitEntity extends ProviderProfitEntity {
  type: ProviderProfitType.SPECIFIC;
  port: string;
  category: BookingCategory;
}

export const isProviderProfitEntity = (value: any): value is string => 'id' in value;
export const isDefaultProviderProfitEntity = (value: ProviderProfitEntity): value is DefaultProviderProfitEntity =>
  value.type === ProviderProfitType.DEFAULT;

export const isSpecificProviderProfitEntity = (value: ProviderProfitEntity): value is SpecificProviderProfitEntity =>
  value.type === ProviderProfitType.SPECIFIC;

export type ProviderProfit = Omit<ProviderProfitEntity, 'id' | 'createdAt'>;
export type DefaultProviderProfit = Omit<DefaultProviderProfitEntity, 'id' | 'createdAt'>;
export type SpecificProviderProfit = Omit<SpecificProviderProfitEntity, 'id' | 'createdAt'>;
export default ProviderProfitEntity;

/*
  When we want to add on price, we fetch specific profit first, if there is no profit, after that we fetch default and add that on price, we do this on api
 */
