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
import useModal from '../../../../hooks/useModal';
import SemiAutomaticRouteDialog from './SemiAutomaticRouteDialog';
import { EditableTextItem } from './ManualRouteDialog';
import TransportModeInput from '../../../inputs/TransportModeInput';
import theme from '../../../../theme';

interface SemiAutomaticRouteRowProps {
  provider: ProviderEntity;
  route: SemiAutomaticProviderRouteEntity;
}

const SemiAutomaticRouteRow: React.FC<SemiAutomaticRouteRowProps> = ({ route, provider }) => {
  const [isEditing, setEditing] = useState(false);
  const { openModal, closeModal, isOpen } = useModal();

  // const [destination, setSelectedDestination] = useState<Destination>(route.origin);
  const [selectedRoutes, setSelectedRoutes] = useLandTransportSemiAutomaticContext();
  useEffect(() => {
    setSelectedRoutes(route.selectedRoutes || []);
  }, [route, setSelectedRoutes]);
  const [stateRoute, setStateRoute] = useState(route);
  const handleSavePriceListRoutes = async () => {};
  return (
    <>
      <Box
        border={1}
        p={2}
        borderRadius={5}
        borderColor="primary"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        style={{ cursor: isEditing ? 'default' : 'pointer' }}
        onClick={event => {
          if (isEditing) return;
          event.preventDefault();
          event.stopPropagation();
          openModal();
        }}
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
        <Box
          width={'40%'}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          style={{ gap: theme.spacing(4) }}
        >
          <Box width={'50%'}>
            <EditableTextItem
              editing={isEditing}
              value={stateRoute.transportMode || ''}
              Element={
                <TransportModeInput
                  value={stateRoute.transportMode}
                  label={'Transport Mode'}
                  onChange={transportMode =>
                    setStateRoute(prev => ({
                      ...prev,
                      transportMode,
                    }))
                  }
                />
              }
            />
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
                  setSelectedRoutes(route.selectedRoutes || []);
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
        </Box>

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
      {isOpen && <SemiAutomaticRouteDialog isOpen={isOpen} closeModal={closeModal} route={route} provider={provider} />}
    </>
  );
};

export default (props: SemiAutomaticRouteRowProps) => (
  <LandTransportSemiAutomaticProvider>
    <SemiAutomaticRouteRow {...props} />
  </LandTransportSemiAutomaticProvider>
);
