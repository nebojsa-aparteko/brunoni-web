import { Provider } from '../model/land-transport/providers/Provider';
import firebase from '../firebase';
import { ProviderProfit } from '../model/land-transport/providers/ProviderProfit';
import { ProviderPricelist } from '../model/land-transport/providers/ProviderPricelists';

const landTransportRef = firebase.firestore().collection('land-transport-config');
const landTransportProfitRef = (providerId: string) =>
  firebase.firestore().collection(`land-transport-config/${providerId}/profit`);
const landTransportProfitDocRef = (providerId: string, profitId: string) =>
  firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/profit`)
    .doc(profitId);

const landTransportPricelistRef = (providerId: string) =>
  firebase.firestore().collection(`land-transport-config/${providerId}/pricelist`);
const landTransportPricelistDocRef = (providerId: string, profitId: string) =>
  firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/pricelist`)
    .doc(profitId);

export const addLandTransportProvider = (provider: Provider) =>
  landTransportRef.add({ ...provider, createdAt: new Date() });

export const addLandTransportProfit = (providerId: string, profit: ProviderProfit) =>
  landTransportProfitRef(providerId).add({ ...profit, createdAt: new Date() });

export const editLandTransportProfit = (providerId: string, profitId: string, profit: ProviderProfit) =>
  landTransportProfitDocRef(providerId, profitId).set(profit, { merge: true });

export const deleteLandTransportProfit = (providerId: string, profitId: string) =>
  landTransportProfitDocRef(providerId, profitId).delete();

export const addLandTransportPricelist = (providerId: string, pricelist: ProviderPricelist) => {
  console.log(pricelist);

  return landTransportPricelistRef(providerId).add({ ...pricelist, createdAt: new Date() });
};

export const editLandTransportPricelist = (providerId: string, pricelistId: string, pricelist: ProviderPricelist) => {
  console.log(pricelist);
  return landTransportPricelistDocRef(providerId, pricelistId).set(pricelist, { merge: true });
};

export const deleteLandTransportPricelist = (providerId: string, pricelistId: string) =>
  landTransportPricelistDocRef(providerId, pricelistId).delete();
