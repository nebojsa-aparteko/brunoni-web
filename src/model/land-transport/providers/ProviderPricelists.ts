import Entity from '../../Entity';
import { PricePerContainer } from './ProviderRoutes';
import { Currency } from '../../Payment';

interface ProviderPricelistEntity extends Entity {
  pricePerContainer: PricePerContainer;
  distance: number;
  currency: Currency;
  category: ProviderPricelistCategory;
}

export enum ProviderPricelistCategory {
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

export const isImportProviderPricelistEntity = (value: ProviderPricelistEntity) =>
  value.category === ProviderPricelistCategory.IMPORT;

export const isExportProviderPricelistEntity = (value: ProviderPricelistEntity) =>
  value.category === ProviderPricelistCategory.EXPORT;

export type ProviderPricelist = Omit<ProviderPricelistEntity, 'id' | 'createdAt'>;

export default ProviderPricelistEntity;
