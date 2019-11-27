import ContainerType from './ContainerType';
import CommodityType from './CommodityType';
import PickupLocation from './PickupLocation';

export default interface Container {
  containerType?: ContainerType;
  commodityType?: CommodityType;
  location?: PickupLocation;
  quantity: number;
}
