import firebase from '../firebase';

export const getDistancesByCountryAndCityId = (countryId: string, startCityId: string) =>
  firebase
    .firestore()
    .collection(`countries/${countryId}/cities`)
    .doc(startCityId)
    .collection('routes')
    .orderBy('name')
    .get();
