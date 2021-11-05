import { Provider } from '../model/land-transport/providers/Provider';
import firebase from '../firebase';
import { ProviderProfit } from '../model/land-transport/providers/ProviderProfit';

const landTransportRef = firebase.firestore().collection('land-transport-config');
const landTransportProfitRef = (id: string) => firebase.firestore().collection(`land-transport-config/${id}/profit`);

export const addLandTransportProvider = (provider: Provider) =>
  landTransportRef.add({ ...provider, createdAt: new Date() });

export const addLandTransportProfit = (providerId: string, profit: ProviderProfit) =>
  landTransportProfitRef(providerId).add({ ...profit, createdAt: new Date() });
