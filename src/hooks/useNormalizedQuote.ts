import { useContext, useMemo } from 'react';
import ContainerTypes from '../contexts/ContainerTypes';
import CommodityTypes from '../contexts/CommodityTypes';
import PickupLocations from '../contexts/PickupLocations';
import Ports from '../contexts/Ports';
import Carriers from '../contexts/Carriers';
import { getEntity, normalizeQuote } from '../providers/QuoteGroupsProvider';

const useNormalizeQuote = () => {
  const containerTypes = useContext(ContainerTypes);
  const commodityTypes = useContext(CommodityTypes);
  const pickupLocations = useContext(PickupLocations);
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);

  return useMemo(() => {
    const getContainerType = getEntity(containerTypes, containerType => containerType.id);
    const getCommodityType = getEntity(commodityTypes, commodityType => commodityType.id);
    const getPickupLocation = getEntity(pickupLocations, pickupLocation => pickupLocation.id);
    const getPort = getEntity(ports, port => port.id);
    const getCarrier = getEntity(carriers, carrier => carrier.name);

    return normalizeQuote(
      getContainerType,
      getCommodityType,
      getPickupLocation,
      getPort,
      getCarrier,
    );
  }, [containerTypes, commodityTypes, pickupLocations, ports, carriers]);
};

export default useNormalizeQuote;
