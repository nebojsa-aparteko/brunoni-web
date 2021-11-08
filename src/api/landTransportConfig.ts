import { Provider } from '../model/land-transport/providers/Provider';
import firebase from '../firebase';
import { ProviderProfit } from '../model/land-transport/providers/ProviderProfit';

const landTransportRef = firebase.firestore().collection('land-transport-config');
const landTransportProfitRef = (providerId: string) =>
  firebase.firestore().collection(`land-transport-config/${providerId}/profit`);
const landTransportProfitDocRef = (providerId: string, profitId: string) =>
  firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/profit`)
    .doc(profitId);

export const addLandTransportProvider = (provider: Provider) =>
  landTransportRef.add({ ...provider, createdAt: new Date() });

export const addLandTransportProfit = (providerId: string, profit: ProviderProfit) =>
  landTransportProfitRef(providerId).add({ ...profit, createdAt: new Date() });

export const editLandTransportProfit = (providerId: string, profitId: string, profit: ProviderProfit) =>
  landTransportProfitDocRef(providerId, profitId).set(profit, { merge: true });

export const deleteLandTransportProfit = (providerId: string, profitId: string) =>
  landTransportProfitDocRef(providerId, profitId).delete();
