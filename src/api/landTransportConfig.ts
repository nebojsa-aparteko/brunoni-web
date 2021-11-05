import { Provider } from '../model/land-transport/providers/Provider';
import firebase from '../firebase';

const landTransportRef = firebase.firestore().collection('land-transport-config');
const landTransportProfitRef = (id: string) => firebase.firestore().collection(`land-transport-config/${id}/profit`);

export const addLandTransportProvider = (provider: Provider) => landTransportRef.add(provider);

export const addLandTransportProfit = (providerId: string, profit: any) =>
  landTransportProfitRef(providerId).add(profit);
