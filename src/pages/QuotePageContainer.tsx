import React, { useContext, useMemo } from 'react';
import { RouteComponentProps } from 'react-router';
import QuoteView from '../components/QuoteView';
import useFirestoreDocument from '../hooks/useFirestoreDocument';
import { Booking } from '../model/Booking';
import ContainerTypes from '../contexts/ContainerTypes';
import CommodityTypes from '../contexts/CommodityTypes';
import PickupLocations from '../contexts/PickupLocations';
import Ports from '../contexts/Ports';
import Carriers from '../contexts/Carriers';
import { getEntity, normalizeQuote } from '../providers/QuoteGroupsProvider';
import ActingAs from '../contexts/ActingAs';

interface Props extends RouteComponentProps<{ id: string }> {}

const QuotePageContainer: React.FC<Props> = ({ match }) => {
  const quoteId = match.params.id;
  const quoteSnapshot = useFirestoreDocument('quotes', quoteId);

  const actingAs = useContext(ActingAs)[0];

  const quoteDoc = quoteSnapshot ? ({ id: quoteSnapshot.id, ...quoteSnapshot.data() } as Booking) : undefined;

  const containerTypes = useContext(ContainerTypes);
  const commodityTypes = useContext(CommodityTypes);
  const pickupLocations = useContext(PickupLocations);
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);

  const normalize = useMemo(() => {
    const getContainerType = getEntity(containerTypes, containerType => containerType.id);
    const getCommodityType = getEntity(commodityTypes, commodityType => commodityType.id);
    const getPickupLocation = getEntity(pickupLocations, pickupLocation => pickupLocation.id);
    const getPort = getEntity(ports, port => port.id);
    const getCarrier = getEntity(carriers, carrier => carrier.name);

    return normalizeQuote(getContainerType, getCommodityType, getPickupLocation, getPort, getCarrier);
  }, [containerTypes, commodityTypes, pickupLocations, ports, carriers]);

  const quote = useMemo(() => (quoteDoc ? normalize(quoteDoc) : undefined), [quoteDoc]);

  return <QuoteView quote={quote} loading={!quoteSnapshot} showCompanyInfo={!actingAs} />;
};

export default QuotePageContainer;
