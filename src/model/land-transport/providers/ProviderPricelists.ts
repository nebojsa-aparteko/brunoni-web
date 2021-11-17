import Price from '../../Price';
import Entity from '../../Entity';

interface ProviderPricelistEntity extends Entity {
  prices: Price[];
  distance: string;
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
