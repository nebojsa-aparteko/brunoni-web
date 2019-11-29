import React, { useContext, useMemo } from 'react';
import parseDate from 'date-fns/parse';
import update from 'lodash/fp/update';
import orderBy from 'lodash/fp/orderBy';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import set from 'lodash/fp/set';
import uniqBy from 'lodash/fp/uniqBy';
import groupBy from 'lodash/fp/groupBy';
import mapValues from 'lodash/fp/mapValues';
import keys from 'lodash/fp/keys';
import flatten from 'lodash/fp/flatten';
import values from 'lodash/fp/values';
import partialRight from 'lodash/fp/partialRight';
import Context from '../contexts/QuotesEndpoint';
import QuotesResult from '../model/quotes/QuotesResult';
import useEndpoint from '../hooks/useEndpoint';
import withTestData from '../utilities/withTestData';
import asArray from '../utilities/asArray';
import PickupLocation from '../model/PickupLocation';
import ContainerType from '../model/ContainerType';
import CommodityType from '../model/CommodityType';
import ContainerTypes from '../contexts/ContainerTypes';
import CommodityTypes from '../contexts/CommodityTypes';
import PickupLocations from '../contexts/PickupLocations';
import Ports from '../contexts/Ports';
import Port from '../model/Port';
import pickAndRename from '../utilities/pickAndRename';
import Container from '../model/Container';
import Carrier from '../model/Carrier';
import Carriers from '../contexts/Carriers';
import logAs from '../utilities/logAs';

interface Props {
  children: React.ReactNode;
}

export interface QuoteGroup {
  id: string;
  dateIssued: Date;
  origin: Port;
  destination: Port;
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

const flattenEntity = (name: string) => flow(asArray, map(flow(update(name, asArray), get(name))), flatten);

const normalizeDateRange = (value: string) => {
  const [from, to] = value.split(' - ');

  return {
    from: parseDate(from, 'dd.MM.yyyy', 0),
    to: parseDate(to, 'dd.MM.yyyy', 0),
  };
};

const normalizeQuoteGroups = (
  getContainerType: (id: string) => ContainerType | null,
  getCommodityType: (id: string) => CommodityType | null,
  getPickupLocation: (id: string | null) => PickupLocation | null,
  getPort: (id: string) => Port | null,
  getCarrier: (name: string) => Carrier | null,
) => {
  const normalizeContainer = flow(
    pickAndRename({
      CtypID: 'containerType',
      CommodityID: 'commodityType',
      PickupAdrID: 'pickupLocation',
      Quantity: 'quantity',
    }),
    update('containerType', getContainerType),
    update('commodityType', getCommodityType),
    update('pickupLocation', getPickupLocation),
    update('quantity', Number),
  );

  const normalizeContainers = flow(asArray, map(normalizeContainer));
  const uniqueCommodityTypes = flow(map(get('commodityType')), uniqBy('id'));

  // commodityTypes: uniqBy('id') ( values(mapValues(get('commodityType')) (normalizedQuote.containers)  )),

  const normalizeQuote = flow(
    pickAndRename({
      AdrId: 'clientId',
      idRequest: 'groupId',
      QuoteNumber: 'id',
      CarrierID: 'carrier',
      QuoteDate: 'dateIssued',
      QuoteValidity: 'validityPeriod',
      POL: 'origin',
      POD: 'destination',
      CargoDetails: 'containers',
      QuoteDetails: 'quoteDetails',
      CostDetailsRemarks: 'costDetailRemarks',
      ServiceDetail: 'serviceDetails',
      Remarks: 'remarks',
      Terms: 'terms',
    }),
    update('carrier', getCarrier),
    update('dateIssued', partialRight(parseDate, ['dd.MM.yyyy', 0])),
    update('validityPeriod', normalizeDateRange),
    update('origin', getPort),
    update('destination', getPort),
    update('containers', normalizeContainers),
  );

  // const uniqueCommTypes
  // (quote) => uniqBy('id')(values(mapValues(get('commodityType'))(get('containers', quote))));
  const normalizeQuotes = flow(map(normalizeQuote), orderBy(get('validityPeriod.from'), 'asc'));

  const normalizeQuoteGroup = flow(
    map(
      flow(
        update('QuoteDetails', flattenEntity('QuoteDetail')),
        update('CostDetailsRemarks', flattenEntity('CostDetailRemark')),
        update('ServiceDetail', asArray),
        update('CargoDetails', flattenEntity('CargoDetail')),
        update('Remarks', flattenEntity('Remark')),
        update('Terms', flattenEntity('Term')),
      ),
    ),
    quotes => {
      const normalizedQuotes = (normalizeQuotes(quotes) as Quote[]).map(quote => {
        return set('commodityTypes', uniqueCommodityTypes(quote.containers))(quote);
      });

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
    },
  );

  return flow(
    get('QuoteHeader'),
    groupBy('idRequest'),
    values,
    map(normalizeQuoteGroup),
    orderBy(get('dateIssued'), 'desc'),
  ) as (result: QuotesResult) => QuoteGroup[];
};

const QuotesEndpoint: React.FC<Props> = ({ children }) => {
  const containerTypes = useContext(ContainerTypes);
  const commodityTypes = useContext(CommodityTypes);
  const pickupLocations = useContext(PickupLocations);
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);

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

  const initialResults = withTestData('quotes', normalize);

  const quotes = useEndpoint('/quotes', normalize, initialResults);

  return <Context.Provider value={quotes}>{children}</Context.Provider>;
};

export default QuotesEndpoint;
