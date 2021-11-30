import React, { useContext, useState } from 'react';
import CityInput from '../../../inputs/CityInput';
import { SeparatorArrow } from '../../../vesselWithVoyage/VesselVoyageItem';
import { Box, Button } from '@material-ui/core';
import RoutesMultiInput from '../../../inputs/RoutesMultiInuput';
import City from '../../../../model/City';
import RouteFromCity from '../../../../model/RouteFromCity';
import useGlobalAppState from '../../../../hooks/useGlobalAppState';
import TransportModeInput from '../../../inputs/TransportModeInput';
import PortInput from '../../../inputs/PortInput';
import Ports from '../../../../contexts/Ports';
import Port from '../../../../model/Port';

const SemiAutomaticRoutes: React.FC<{ savePricelistRoutes: (selectedRoutes: RouteFromCity[]) => void }> = ({
  savePricelistRoutes,
}) => {
  const ports = useContext(Ports);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<RouteFromCity[]>([]);
  const [selectedTransportMode, setSelectedTransportMode] = useState<string | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [, dispatch] = useGlobalAppState();

  const handleSavePricelistRoutes = async () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    await savePricelistRoutes(
      selectedRoutes.map(
        route => ({ ...route, portOfLoading: selectedPort, transportModus: selectedTransportMode } as RouteFromCity),
      ),
    );
    dispatch({ type: 'STOP_GLOBAL_LOADING' });
  };

  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <CityInput onSelect={city => setSelectedCity(city || null)} />
      <SeparatorArrow />
      <RoutesMultiInput
        startingCity={selectedCity || undefined}
        selectedRoutes={selectedRoutes}
        setSelectedRoutes={setSelectedRoutes}
      />
      <Box style={{ marginLeft: 8, width: 170 }}>
        <TransportModeInput value={selectedTransportMode} onChange={setSelectedTransportMode} margin="dense" />
      </Box>
      <PortInput
        value={selectedPort || undefined}
        margin="dense"
        label="Port"
        ports={ports || []}
        onChange={setSelectedPort}
      />
      <Button
        disabled={
          !selectedRoutes || selectedRoutes.length === 0 || !selectedCity || !selectedTransportMode || !selectedPort
        }
        onClick={handleSavePricelistRoutes}
        variant="contained"
        color="primary"
        style={{ height: 38, marginTop: 4, marginLeft: 'auto', marginRight: 0 }}
      >
        Save Pricelist Routes
      </Button>
    </Box>
  );
};

export default SemiAutomaticRoutes;
