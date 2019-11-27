import React, { useContext, useMemo } from 'react';
import parseDate from 'date-fns/parse';
import update from 'lodash/fp/update';
import sortBy from 'lodash/fp/sortBy';
import reverse from 'lodash/fp/reverse';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import groupBy from 'lodash/fp/groupBy';
import flatten from 'lodash/fp/flatten';
import values from 'lodash/fp/values';
import Context from '../contexts/QuotesEndpoint';
import { CargoDetail, CargoDetailCargoDetail, QuoteHeader } from '../model/quotes/QuotesResult';

import useEndpoint from '../hooks/useEndpoint';
import useTestData from '../utilities/useTestData';
import asArray from '../utilities/asArray';
import PickupLocation from '../model/PickupLocation';
import ContainerType from '../model/ContainerType';
import CommodityType from '../model/CommodityType';
import ContainerTypes from '../contexts/ContainerTypes';
import CommodityTypes from '../contexts/CommodityTypes';
import PickupLocations from '../contexts/PickupLocations';
import Ports from '../contexts/Ports';
import Port from '../model/Port';

interface Props {
  children: React.ReactNode;
}

const flattenEntity = (name: string) => flow(asArray, map(flow(update(name, asArray), get(name))), flatten);

const normalizeQuotes = (
  getContainerType: (id: string) => ContainerType | null,
  getCommodityType: (id: string) => CommodityType | null,
  getPickupLocation: (id: string | null) => PickupLocation | null,
  getPort: (id: string) => Port | null,
) =>
  flow(
    get('QuoteHeader'),
    groupBy('idRequest'),
    values,
    map(
      flow(
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
        sortBy((quote: QuoteHeader) => quote.QuoteDate),
        quotes => ({
          id: quotes[0].idRequest,
          date: parseDate(quotes[0].QuoteDate, 'dd.MM.yyyy', 0),
          origin: getPort(quotes[0].POL),
          destination: getPort(quotes[0].POD),
          containers: asArray(quotes[0].CargoDetails).map(((cargo: CargoDetailCargoDetail) => ({
            containerType: getContainerType(cargo.CtypID),
            commodityType: getCommodityType(cargo.CommodityID),
            pickupLocation: getPickupLocation(cargo.PickupAdrID),
            quantity: Number(cargo.Quantity),
          })) as any),
          quotes,
        }),
      ),
    ),
    sortBy(get('date')),
    reverse,
  );

const QuotesEndpoint: React.FC<Props> = ({ children }) => {
  const containerTypes = useContext(ContainerTypes);
  const commodityTypes = useContext(CommodityTypes);
  const pickupLocations = useContext(PickupLocations);
  const ports = useContext(Ports);

  const normalize = useMemo(() => {
    return normalizeQuotes(
      (id: string) => (id ? containerTypes?.find(i => i.id === id) || ({ id } as ContainerType) : null),
      (id: string) => (id ? commodityTypes?.find(i => i.id === id) || ({ id } as CommodityType) : null),
      (id: string | null) => (id ? pickupLocations?.find(i => i.id === id) || ({ id } as PickupLocation) : null),
      (id: string) => (id ? ports?.find(i => i.id === id) || ({ id } as Port) : null),
    );
  }, [containerTypes, commodityTypes, pickupLocations, ports]);

  const initialResults = useTestData('quotes', normalize);

  const quotes = useEndpoint('/quotes', normalize, initialResults);

  return <Context.Provider value={quotes}>{children}</Context.Provider>;
};

export default QuotesEndpoint;
