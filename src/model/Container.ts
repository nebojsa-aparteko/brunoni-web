import ContainerType from './ContainerType';
import CommodityType from './CommodityType';
import PickupLocation from './PickupLocation';

export default interface Container {
  containerNumbers?: string[];
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
  demDetTariffs?: Tariff[];
  storageTariffs?: Tariff[];
  pluginTariffs?: Tariff[];
}

export enum Ventilation {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface Tariff {
  id: string;
  days: string;
  text: string;
  description?: string;
}
