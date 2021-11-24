import React, { useState } from 'react';
import CityInput from '../../../inputs/CityInput';
import { SeparatorArrow } from '../../../vesselWithVoyage/VesselVoyageItem';
import { Box, Button } from '@material-ui/core';
import RoutesMultiInput from '../../../inputs/RoutesMultiInuput';
import City from '../../../../model/City';
import RouteFromCity from '../../../../model/RouteFromCity';
import useGlobalAppState from '../../../../hooks/useGlobalAppState';

const SemiAutomaticRoutes: React.FC<{ savePricelistRoutes: (selectedRoutes: RouteFromCity[]) => void }> = ({
  savePricelistRoutes,
}) => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<RouteFromCity[]>([]);
  const [, dispatch] = useGlobalAppState();

  const handleSavePricelistRoutes = async () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    await savePricelistRoutes(selectedRoutes);
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
      <Button
        disabled={!selectedRoutes || selectedRoutes.length === 0 || !selectedCity}
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
