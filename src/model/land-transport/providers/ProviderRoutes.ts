import Price from '../../Price';

interface ProviderRoutes {
  type: ProviderRoutesType;
}

export interface AutomaticProviderRoutes extends ProviderRoutes {
  version: string;
  addedAt: Date;
  active: boolean;
}

export interface ManualProviderRoutes extends ProviderRoutes {
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
