import React, { useEffect, useState } from 'react';
import LandTransportSemiAutomaticProvider, {
  useLandTransportSemiAutomaticContext,
} from '../../../../providers/LandTransportSemiAutomaticProvider';
import { Box, IconButton } from '@material-ui/core';
import CityInput from '../../../inputs/CityInput';
import { set } from 'lodash/fp';
import { SeparatorArrow } from '../../../vesselWithVoyage/VesselVoyageItem';
import RoutesMultiInput from '../../../inputs/RoutesMultiInuput';
import { editLandTransportRoute } from '../../../../api/landTransportConfig';
import { SemiAutomaticProviderRouteEntity } from '../../../../model/land-transport/providers/ProviderRoutes';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';

interface SemiAutomaticRouteRowProps {
  provider: ProviderEntity;
  route: SemiAutomaticProviderRouteEntity;
}
const SemiAutomaticRouteRow: React.FC<SemiAutomaticRouteRowProps> = ({ route, provider }) => {
  const [isEditing, setEditing] = useState(false);
  // const [destination, setSelectedDestination] = useState<Destination>(route.origin);
  const [selectedRoutes, setSelectedRoutes] = useLandTransportSemiAutomaticContext();
  useEffect(() => {
    setSelectedRoutes(route.selectedRoutes || []);
  }, [route]);
  const [stateRoute, setStateRoute] = useState(route);
  const handleSavePricelistRoutes = async () => {};
  return (
    <Box
      border={1}
      p={2}
      borderRadius={5}
      borderColor="primary"
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box display="flex" flexDirection="row" alignItems="center">
        <CityInput
          isEditing={isEditing}
          onSelect={(value, path) => setStateRoute(prevState => set(`origin.${path}`, value)(prevState))}
          origin={stateRoute.origin}
        />
        <SeparatorArrow />
        <RoutesMultiInput isEditing={isEditing} startingDestination={stateRoute.origin} />
      </Box>
      {isEditing ? (
        <Box display="flex">
          <IconButton
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              editLandTransportRoute(provider.id, stateRoute.id, {
                ...stateRoute,
                selectedRoutes,
              } as SemiAutomaticProviderRouteEntity).then(() => setEditing(false));
            }}
          >
            <CheckIcon />
          </IconButton>
          <IconButton
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              setStateRoute(route);
              setSelectedRoutes(route.selectedRoutes);
              setEditing(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      ) : (
        <Box>
          <IconButton
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              setEditing(true);
            }}
          >
            <EditIcon />
          </IconButton>
        </Box>
      )}

      {/*<PricelistTable*/}
      {/*  route={route}*/}
      {/*  tableTitle="Export"*/}
      {/*  provider={provider}*/}
      {/*  pricelists={priceLists?.exportPricelistEntities}*/}
      {/*  category={ProviderPricelistCategory.EXPORT}*/}
      {/*/>*/}
      {/*<PricelistTable*/}
      {/*  route={route}*/}
      {/*  tableTitle="Import"*/}
      {/*  provider={provider}*/}
      {/*  pricelists={priceLists?.importPricelistEntities}*/}
      {/*  category={ProviderPricelistCategory.IMPORT}*/}
      {/*/>*/}
    </Box>
  );
};

export default (props: SemiAutomaticRouteRowProps) => (
  <LandTransportSemiAutomaticProvider>
    <SemiAutomaticRouteRow {...props} />
  </LandTransportSemiAutomaticProvider>
);
