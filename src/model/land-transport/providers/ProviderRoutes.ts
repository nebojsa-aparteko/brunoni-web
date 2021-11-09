import Price from '../../Price';

interface ProviderRoutes {
  type: ProviderRoutesType;
}

export interface AutomaticProviderRoutes extends ProviderRoutes {
  type: ProviderRoutesType.AUTOMATIC;
  version: string;
  addedAt: Date;
  active: boolean;
}

export interface ManualProviderRoutes extends ProviderRoutes {
  type: ProviderRoutesType.MANUAL;
  origin: string;
  destination: string;
  transportMode: string;
  price: Price;
}

enum ProviderRoutesType {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}

export default ProviderRoutes;
