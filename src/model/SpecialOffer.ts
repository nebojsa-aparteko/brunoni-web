import Carrier from './Carrier';
import ContainerType from './ContainerType';
import Port from './Port';

export default interface SpecialOffer {
  id: string;
  carrier: Carrier;
  containerType: ContainerType;
  destination: Port;
  image: string;
  origin: Port;
  price: {
    amount: string;
    currency: string;
  };
  validUntil: Date;
}
