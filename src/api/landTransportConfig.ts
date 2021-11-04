import { Provider } from '../model/land-transport/providers/Provider';
import firebase from '../firebase';

const landTransportRef = firebase.firestore().collection('land-transport-config');

export const addLandTransportProvider = (provider: Provider) => landTransportRef.add(provider);
