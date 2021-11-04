import { BookingCategory } from '../../Booking';
import Price from '../../Price';

interface ProviderProfit {
  type: ProviderProfitType;
  containerType: string;
  price: Price;
}
export enum ProviderProfitType {
  DEFAULT = 'DEFAULT',
  SPECIFIC = 'SPECIFIC',
}

export interface DefaultProviderProfit extends ProviderProfit {
  type: ProviderProfitType.DEFAULT;
}
export interface SpecificProviderProfit extends ProviderProfit {
  type: ProviderProfitType.SPECIFIC;
  port: string;
  category: BookingCategory;
}

export default ProviderProfit;
/*
  When we want to add on price, we fetch specific profit first, if there is no profit, after that we fetch default and add that on price, we do this on api
 */
