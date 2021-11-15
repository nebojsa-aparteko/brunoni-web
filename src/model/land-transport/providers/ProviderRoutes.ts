import Price from '../../Price';
import firebase from 'firebase';

interface ProviderRoute {
  id: string;
  type: ProviderRoutesType;
}

export interface AutomaticProviderRoute extends Omit<ProviderRoute, 'id'> {
  version: string; //work as id
  addedAt: firebase.firestore.Timestamp;
  active: boolean;
}

export interface ManualProviderRoute extends ProviderRoute {
  origin: string;
  destination: string;
  transportMode: string;
  price: Price;
}

export enum ProviderRoutesType {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}
