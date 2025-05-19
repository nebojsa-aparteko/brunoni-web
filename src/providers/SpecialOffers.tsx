import React, { useContext, useEffect, useMemo, useState } from 'react';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';

import SpecialOffersContext from '../contexts/SpecialOffers';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import SpecialOffer from '../model/SpecialOffer';
import ContainerTypes from '../contexts/ContainerTypes';
import Ports from '../contexts/Ports';
import Carriers from '../contexts/Carriers';
import firebase from '../firebase';

interface Props {
  children: React.ReactNode;
}

const query = (collection: firebase.firestore.CollectionReference) =>
  collection.where('validUntil', '>', new Date());

const SpecialOffers: React.FC<Props> = ({ children }) => {
  const snapshot = useFirestoreCollection('special-offers', query);

  const offers = useMemo(
    () => snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    [snapshot],
  );

  const containerTypes = useContext(ContainerTypes);
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);

  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[] | undefined>(undefined);

  useEffect(() => {
    if (offers === undefined) {
      return;
    }

    const getEntity =
      <T extends { id: string }>(collection: T[] | null | undefined, prop: (i: T) => string) =>
      (id: string | null | undefined) =>
        id ? collection?.find(i => prop(i) === id) || ({ id } as T) : null;

    const getContainerType = getEntity(containerTypes, containerType => containerType.id);
    const getPort = getEntity(ports, port => port.id);
    const getCarrier = getEntity(carriers, carrier => carrier.id);

    setSpecialOffers(
      map(
        flow(
          update('carrier', getCarrier),
          update('containerType', getContainerType),
          update('destination', getPort),
          update('origin', getPort),
          update('validUntil', invoke('toDate')),
        ),
      )(offers),
    );
  }, [offers, containerTypes, ports, carriers]);

  return (
    <SpecialOffersContext.Provider value={specialOffers}>{children}</SpecialOffersContext.Provider>
  );
};

export default SpecialOffers;
