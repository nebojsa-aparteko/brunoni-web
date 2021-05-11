import ContainerType from './ContainerType';
import CommodityType from './CommodityType';
import PickupLocation from './PickupLocation';

export default interface Container {
  containerType?: ContainerType;
  commodityType?: CommodityType;
  pickupLocation?: PickupLocation;
  pickupDate?: Date;
  quantity: number;
  weight?: number;
  temperature?: number;
  humidity?: string;
  ventilation?: Ventilation;
  pickupReference?: string;
  deliveryReference?: string;
  vgmPin?: string;
}

export enum Ventilation {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}
