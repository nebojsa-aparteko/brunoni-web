import { ContainerType } from './ContainerType';
import { CommodityType } from './CommodityType';

export interface Container {
  containerType?: ContainerType;
  commodityType?: CommodityType;
  quantity: number;
}
