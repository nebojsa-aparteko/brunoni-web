import React, { useContext, useMemo, useState, useEffect } from 'react';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import get from 'lodash/fp/get';
import filter from 'lodash/fp/filter';
import Context from '../contexts/Bookings';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import ContainerTypes from '../contexts/ContainerTypes';
import PickupLocations from '../contexts/PickupLocations';
import CommodityTypes from '../contexts/CommodityTypes';
import { Booking } from '../model/Booking';
import ContainerType from '../model/ContainerType';
import CommodityType from '../model/CommodityType';
import PickupLocation from '../model/PickupLocation';
import asArray from '../utilities/asArray';

interface Props {
  children: React.ReactNode;
}

const normalizeBookingsData = (
  getContainerType: (id: string) => ContainerType | null,
  getCommodityType: (id: string) => CommodityType | null,
  getPickupLocation: (id: string | null) => PickupLocation | null,
) => {
  const normalizeContainer = flow(
    update('containerType', getContainerType),
    container =>
      update('commodityType', commodityType =>
        commodityType.trim() === '0'
          ? { id: get('commodityText')(container), name: get('commodityText')(container) }
          : getCommodityType(commodityType),
      )(container),
    update('pickupLocation', getPickupLocation),
  );

  const normalizeContainers = flow(
    asArray,
    map(normalizeContainer),
    filter(container => container.containerType !== null),
  );

  const normalizeBooking = flow(
    update('containers', normalizeContainers),
  );

  return flow(
    map(normalizeBooking),
  );
}

const BookingsAdmin: React.FC<Props> = ({ children }) => {
  const containerTypes = useContext(ContainerTypes);
  const commodityTypes = useContext(CommodityTypes);
  const pickupLocations = useContext(PickupLocations);

  const snapshot = useFirestoreCollection('bookings');
  const bookingsResult = useMemo(() => snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })), [snapshot]);

  const [bookings, setBookings] = useState<Booking[] | undefined>(undefined);

  const normalize = useMemo(() => {
    const getEntity = <T extends { id: string }>(collection: T[] | null | undefined, prop: (i: T) => string) => (
      id: string | null | undefined,
    ) => (id ? collection?.find(i => prop(i) === id) || ({ id } as T) : null);

    const getContainerType = getEntity(containerTypes, containerType => containerType.id);
    const getCommodityType = getEntity(commodityTypes, commodityType => commodityType.id);
    const getPickupLocation = getEntity(pickupLocations, pickupLocation => pickupLocation.id);

    return normalizeBookingsData(getContainerType, getCommodityType, getPickupLocation);
  }, [containerTypes, commodityTypes, pickupLocations]);

  const bookingItems = useMemo(() => (bookingsResult === undefined ? undefined : normalize(bookingsResult)), [bookingsResult, normalize]);

  useEffect(() => {
    if ( !bookingItems ) return;

    setBookings(bookingItems);
  }, [ bookingsResult, bookingItems ]);

  return <Context.Provider value={bookings}>{children}</Context.Provider>;
};

export default BookingsAdmin;
