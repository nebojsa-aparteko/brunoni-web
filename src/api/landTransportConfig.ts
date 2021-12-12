import { Provider } from '../model/land-transport/providers/Provider';
import firebase from '../firebase';
import { ProviderProfit } from '../model/land-transport/providers/ProviderProfit';
import { ProviderPricelist } from '../model/land-transport/providers/ProviderPricelists';
import ProviderRouteEntity, {
  ProviderRoute,
  ProviderRoutesType,
} from '../model/land-transport/providers/ProviderRoutes';
import {
  OfferProviderConfig,
  ProviderExtensionEntity,
  ProviderExtensionGroup,
} from '../model/land-transport/providers/ProviderConfig';
import { flow, isNil, omitBy, update } from 'lodash/fp';
import normalizeFirestoreDate from '../utilities/normalizeFirestoreDate';

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
export const hasActiveRoute = async (providerId: string, routeType: ProviderRoutesType) => {
  const routes = await firebase
    .firestore()
    .collection(`/land-transport-config/${providerId}/routes`)
    .where('type', '==', routeType)
    .where('active', '==', true)
    .get();
  const hasActive = routes.size === 1;
  return hasActive
    ? {
        hasActive: true,
        activeRoute: flow(
          update('createdAt', normalizeFirestoreDate),
          update('updatedAt', normalizeFirestoreDate),
          update('validity.startDate', normalizeFirestoreDate),
          update('validity.endDate', normalizeFirestoreDate),
        )(routes.docs[0].data()) as ProviderRouteEntity,
      }
    : {
        hasActive: false,
        activeRoute: null,
      };
};
const landTransportRouteRef = (providerId: string) =>
  firebase.firestore().collection(`land-transport-config/${providerId}/routes`);
const landTransportRouteDocRef = (providerId: string, routeId: string) =>
  firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/routes`)
    .doc(routeId);

export const addLandTransportRoute = (providerId: string, route: ProviderRoute) =>
  landTransportRouteRef(providerId).add({ ...route, createdAt: new Date(), updatedAt: new Date() });

export const editLandTransportRoute = (providerId: string, routeId: string, route: ProviderRoute) =>
  landTransportRouteDocRef(providerId, routeId).set({ ...route, updatedAt: new Date() }, { merge: true });

export const deleteLandTransportRoute = async (providerId: string, routeId: string) =>
  await landTransportRouteDocRef(providerId, routeId).delete();

// Pricelist
const landTransportPriceListRef = (providerId: string, routeId: string) =>
  firebase.firestore().collection(`land-transport-config/${providerId}/routes/${routeId}/price-list`);
const landTransportPriceListDocRef = (providerId: string, routeId: string, priceListId: string) =>
  firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/routes/${routeId}/price-list`)
    .doc(priceListId);

export const addLandTransportPricelist = (providerId: string, routeId: string, pricelist: ProviderPricelist) =>
  landTransportPriceListRef(providerId, routeId).add({ ...pricelist, createdAt: new Date() });

export const editLandTransportPricelist = (
  providerId: string,
  routeId: string,
  pricelistId: string,
  pricelist: ProviderPricelist,
) => landTransportPriceListDocRef(providerId, routeId, pricelistId).set(pricelist, { merge: true });

export const deleteLandTransportPricelist = (providerId: string, routeId: string, pricelistId: string) =>
  landTransportPriceListDocRef(providerId, routeId, pricelistId).delete();

// Extensions config book
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

const landTransportExtensionsRef = (providerId: string, routeId: string, groupId: string) =>
  firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/routes/${routeId}/extensions-group/${groupId}/extensions`);

const landTransportExtensionDocRef = (providerId: string, routeId: string, groupId: string, extensionId: string) =>
  landTransportExtensionsRef(providerId, routeId, groupId).doc(extensionId);

export const addLandTransportExtension = (
  providerId: string,
  routeId: string,
  groupId: string,
  extension: OfferProviderConfig,
) => landTransportExtensionsRef(providerId, routeId, groupId).add({ ...extension, createdAt: new Date() });

export const editLandTransportExtension = (
  providerId: string,
  routeId: string,
  groupId: string,
  extensionId: string,
  extension: OfferProviderConfig,
) => landTransportExtensionDocRef(providerId, routeId, groupId, extensionId).set(extension, { merge: true });

export const deleteLandTransportExtension = (
  providerId: string,
  routeId: string,
  groupId: string,
  extensionId: string,
) => landTransportExtensionDocRef(providerId, routeId, groupId, extensionId).delete();

// Extensions group

const landTransportExtensionsGroupRef = (providerId: string, routeId: string) =>
  firebase.firestore().collection(`land-transport-config/${providerId}/routes/${routeId}/extensions-group`);

const landTransportExtensionGroupDocRef = (providerId: string, routeId: string, extensionGroupId: string) =>
  landTransportExtensionsGroupRef(providerId, routeId).doc(extensionGroupId);

export const addLandTransportExtensionGroup = (
  providerId: string,
  routeId: string,
  extension: ProviderExtensionGroup,
) => landTransportExtensionsGroupRef(providerId, routeId).add({ ...omitBy(isNil)(extension), createdAt: new Date() });

export const editLandTransportExtensionGroup = (
  providerId: string,
  routeId: string,
  extensionId: string,
  extension: ProviderExtensionGroup,
) => landTransportExtensionGroupDocRef(providerId, routeId, extensionId).set(extension, { merge: true });

export const deleteLandTransportExtensionGroup = (providerId: string, routeId: string, extensionId: string) =>
  landTransportExtensionGroupDocRef(providerId, routeId, extensionId).delete();
