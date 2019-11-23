import { ContainerType } from './ContainerType';
import { CommodityType } from './CommodityType';
import { Location } from './Location';

export interface Container {
  containerType?: ContainerType;
  commodityType?: CommodityType;
  location?: Location;
  quantity: number;
}
