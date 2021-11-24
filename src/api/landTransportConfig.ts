import { Provider } from '../model/land-transport/providers/Provider';
import firebase from '../firebase';
import { ProviderProfit } from '../model/land-transport/providers/ProviderProfit';
import { ProviderPricelist } from '../model/land-transport/providers/ProviderPricelists';
import { ProviderRoute } from '../model/land-transport/providers/ProviderRoutes';
import { OfferProviderConfig, ProviderExtensionEntity } from '../model/land-transport/providers/ProviderConfig';

const landTransportRef = firebase.firestore().collection('land-transport-config');

//Provider
const landTransportDocRef = (providerId: string) => landTransportRef.doc(providerId);
export const addLandTransportProvider = (provider: Provider) =>
  landTransportRef.add({ ...provider, createdAt: new Date() });
export const editLandTransportProvider = (providerId: string, provider: Provider) =>
  landTransportDocRef(providerId).set(provider, { merge: true });
export const deleteLandTransportProvider = (providerId: string) => landTransportDocRef(providerId).delete();

//Profit
const landTransportProfitRef = (providerId: string) =>
  firebase.firestore().collection(`land-transport-config/${providerId}/profit`);

const landTransportProfitDocRef = (providerId: string, profitId: string) =>
  firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/profit`)
    .doc(profitId);

export const addLandTransportProfit = (providerId: string, profit: ProviderProfit) =>
  landTransportProfitRef(providerId).add({ ...profit, createdAt: new Date() });

export const editLandTransportProfit = (providerId: string, profitId: string, profit: ProviderProfit) =>
  landTransportProfitDocRef(providerId, profitId).set(profit, { merge: true });

export const deleteLandTransportProfit = (providerId: string, profitId: string) =>
  landTransportProfitDocRef(providerId, profitId).delete();

// Routes
const landTransportRouteRef = (providerId: string) =>
  firebase.firestore().collection(`land-transport-config/${providerId}/routes`);
const landTransportRouteDocRef = (providerId: string, routeId: string) =>
  firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/routes`)
    .doc(routeId);

export const addLandTransportRoute = (providerId: string, profit: ProviderRoute) =>
  landTransportRouteRef(providerId).add({ ...profit, createdAt: new Date() });

export const editLandTransportRoute = (providerId: string, routeId: string, profit: ProviderRoute) =>
  landTransportRouteDocRef(providerId, routeId).set(profit, { merge: true });

export const deleteLandTransportRoute = (providerId: string, profitId: string) =>
  landTransportRouteDocRef(providerId, profitId).delete();

// Pricelist
const landTransportPricelistRef = (providerId: string) =>
  firebase.firestore().collection(`land-transport-config/${providerId}/pricelist`);
const landTransportPricelistDocRef = (providerId: string, profitId: string) =>
  firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/pricelist`)
    .doc(profitId);

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

// Extensions book
const landTransportExtensionsConfigRef = (providerId: string) =>
  firebase.firestore().collection(`land-transport-config/${providerId}/extension-config`);

const landTransportExtensionConfigDocRef = (providerId: string, extensionId: string) =>
  landTransportExtensionsConfigRef(providerId).doc(extensionId);

export const addLandTransportExtensionConfig = (providerId: string, extension: ProviderExtensionEntity) =>
  landTransportExtensionsConfigRef(providerId).add({ ...extension, createdAt: new Date() });

export const editLandTransportExtensionConfig = (
  providerId: string,
  extensionId: string,
  extension: ProviderExtensionEntity,
) => landTransportExtensionConfigDocRef(providerId, extensionId).set(extension, { merge: true });

export const deleteLandTransportExtensionConfig = (providerId: string, extensionId: string) =>
  landTransportExtensionConfigDocRef(providerId, extensionId).delete();

// Extensions table

const landTransportExtensionsRef = (providerId: string) =>
  firebase.firestore().collection(`land-transport-config/${providerId}/extensions`);

const landTransportExtensionDocRef = (providerId: string, extensionId: string) =>
  landTransportExtensionsRef(providerId).doc(extensionId);

export const addLandTransportExtension = (providerId: string, extension: OfferProviderConfig) =>
  landTransportExtensionsRef(providerId).add({ ...extension, createdAt: new Date() });

export const editLandTransportExtension = (providerId: string, extensionId: string, extension: OfferProviderConfig) =>
  landTransportExtensionDocRef(providerId, extensionId).set(extension, { merge: true });

export const deleteLandTransportExtension = (providerId: string, extensionId: string) =>
  landTransportExtensionDocRef(providerId, extensionId).delete();
