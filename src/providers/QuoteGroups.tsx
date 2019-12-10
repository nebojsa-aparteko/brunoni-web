import React, { useContext, useMemo } from 'react';
import update from 'lodash/fp/update';
import orderBy from 'lodash/fp/orderBy';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import set from 'lodash/fp/set';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import identity from 'lodash/fp/identity';
import invoke from 'lodash/fp/invoke';
import uniqBy from 'lodash/fp/uniqBy';
import groupBy from 'lodash/fp/groupBy';
import padStart from 'lodash/fp/padStart';
import flatMap from 'lodash/fp/flatMap';
import values from 'lodash/fp/values';
import Context from '../contexts/QuoteGroups';
import QuotesResult from '../model/quotes/QuotesResult';
import asArray from '../utilities/asArray';
import PickupLocation from '../model/PickupLocation';
import ContainerType from '../model/ContainerType';
import CommodityType from '../model/CommodityType';
import ContainerTypes from '../contexts/ContainerTypes';
import CommodityTypes from '../contexts/CommodityTypes';
import PickupLocations from '../contexts/PickupLocations';
import Ports from '../contexts/Ports';
import Port from '../model/Port';
import Container from '../model/Container';
import Carrier from '../model/Carrier';
import Carriers from '../contexts/Carriers';
import Quotes from '../contexts/Quotes';

interface Props {
  children: React.ReactNode;
}

export interface QuoteGroup {
  id: string;
  dateIssued: Date;
  origin?: Port;
  destination?: Port;
  containers: Container[];
  commodityTypes: CommodityType[];
  quotes: Quote[];
}

export interface Quote {
  clientId: string;
  groupId: string;
  id: string;
  carrier: Carrier;
  dateIssued: Date;
  validityPeriod: { from: Date; to: Date };
  origin: Port;
  destination: Port;
  containers: Container[];
  commodityTypes?: CommodityType[];
  quoteDetails: QuoteDetail[];
  costDetailRemarks: CostDetailRemark[];
  serviceDetails: ServiceDetail[];
  remarks: Remark[];
  terms: Term[];
}

export interface Term {
  TermLabel?: string;
  TermValue: string;
  TermDetail?: string;
  TermURL?: string;
}

export interface QuoteDetail {
  Pos: string;
  Description: string;
  Currency: string;
  CostValue?: string;
  CostUnit?: string;
  Remark?: string;
  RemarkRef?: string;
}

export interface CostDetailRemark {
  RemarkRef: string;
  RemarkText: string;
}

export interface ServiceDetail {
  Frequency: string;
  Routing: string;
  TransitTime: string;
}

export interface Remark {
  Reefer: string;
  RemarkLabel: string;
  RemarkText: string;
  RemarkTitle: string;
}

const normalizeDateRange = flow(update('from', invoke('toDate')), update('to', invoke('toDate')));

const uniqueCommodityTypes = flow(map(get('commodityType')), filter(identity), uniqBy('id'));

const normalizeQuoteGroups = (
  getContainerType: (id: string) => ContainerType | null,
  getCommodityType: (id: string) => CommodityType | null,
  getPickupLocation: (id: string | null) => PickupLocation | null,
  getPort: (id: string) => Port | null,
  getCarrier: (name: string) => Carrier | null,
) => {
  const normalizeContainer = flow(
    update('containerType', getContainerType),
    update('commodityType', commodityType => (commodityType.trim() === '0' ? null : getCommodityType(commodityType))),
    update('pickupLocation', getPickupLocation),
  );

  const normalizeContainers = flow(asArray, map(normalizeContainer));

  const normalizeQuote = flow(
    update('carrier', getCarrier),
    update('dateIssued', invoke('toDate')),
    update('validityPeriod', normalizeDateRange),
    update('origin', getPort),
    update('destination', getPort),
    update('containers', normalizeContainers),
    quote => set('commodityTypes', uniqueCommodityTypes(get('containers')(quote)))(quote),
  );

  const normalizeQuotes = flow(map(normalizeQuote), orderBy(get('validityPeriod.from'), 'asc'));

  const normalizeQuoteGroup = flow(quotes => {
    const normalizedQuotes = normalizeQuotes(quotes) as Quote[];

    const normalizedQuote = normalizedQuotes[0];

    return {
      id: normalizedQuote.groupId,
      dateIssued: normalizedQuote.dateIssued,
      origin: normalizedQuote.origin,
      destination: normalizedQuote.destination,
      containers: normalizedQuote.containers,
      commodityTypes: normalizedQuote.commodityTypes,
      quotes: normalizedQuotes,
    };
  });

  return flow(
    groupBy('groupId'),
    values,
    flatMap((group: any[]) => (group[0].groupId ? [group] : group.map(item => [item]))),
    map(normalizeQuoteGroup),
    orderBy([flow(get('id'), padStart(10)), get('dateIssued')], 'desc'),
  ) as (result: Quote[]) => QuoteGroup[];
};

const QuoteGroups: React.FC<Props> = ({ children }) => {
  const containerTypes = useContext(ContainerTypes);
  const commodityTypes = useContext(CommodityTypes);
  const pickupLocations = useContext(PickupLocations);
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);
  const quotes = useContext(Quotes);

  const normalize = useMemo(() => {
    const getEntity = <T extends { id: string }>(collection: T[] | null | undefined, prop: (i: T) => string) => (
      id: string | null | undefined,
    ) => (id ? collection?.find(i => prop(i) === id) || ({ id } as T) : null);

    const getContainerType = getEntity(containerTypes, containerType => containerType.id);
    const getCommodityType = getEntity(commodityTypes, commodityType => commodityType.id);
    const getPickupLocation = getEntity(pickupLocations, pickupLocation => pickupLocation.id);
    const getPort = getEntity(ports, port => port.id);
    const getCarrier = getEntity(carriers, carrier => carrier.name);

    return normalizeQuoteGroups(getContainerType, getCommodityType, getPickupLocation, getPort, getCarrier);
  }, [containerTypes, commodityTypes, pickupLocations, ports, carriers]);

  const quoteGroups = useMemo(() => (quotes === undefined ? undefined : normalize(quotes)), [quotes, normalize]);

  return <Context.Provider value={quoteGroups}>{children}</Context.Provider>;
};

export default QuoteGroups;
