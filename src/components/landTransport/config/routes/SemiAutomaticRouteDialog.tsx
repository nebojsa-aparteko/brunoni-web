import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { EditableTextItem, Transition } from './ManualRouteDialog';
import {
  ProviderRoutesType,
  SemiAutomaticProviderRouteEntity,
} from '../../../../model/land-transport/providers/ProviderRoutes';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';
import Container from '../../../Container';
import {
  ActionButtons,
  activateRoute,
  Description,
  getValidityInfo,
  Status,
  updateRoute,
  Validity,
} from './RouteDetailsModal';
import SectionWithTitle from '../../../SectionWithTitle';
import InfoBoxItem from '../../../InfoBoxItem';
import DateFormattedText from '../../../DateFormattedText';
import theme from '../../../../theme';
import ArrowForward from '@material-ui/icons/ArrowForward';
import { getOr, keys, omit, set } from 'lodash/fp';
import ConfirmationDialog from '../../../ConfirmationDialog';
import { diff } from 'deep-object-diff';
import RoutesMultiInput from '../../../inputs/RoutesMultiInuput';
import RouteFromCity from '../../../../model/RouteFromCity';
import CountryCodes from '../../../../model/CountryCodes';
import { Dictionary, groupBy } from 'lodash';
import TransportModeInput from '../../../inputs/TransportModeInput';
import Destination from '../../../../model/land-transport/Destination';
import CityInput from '../../../inputs/CityInput';
import City from '../../../../model/City';
import Country from '../../../../model/Country';
import { deleteLandTransportRoute } from '../../../../api/landTransportConfig';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    position: 'relative',
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: theme.spacing(3),
  },
}));

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  route: SemiAutomaticProviderRouteEntity;
  provider: ProviderEntity;
}

const omittedField = ['active'];

const SemiAutomaticRouteDialog: React.FC<Props> = ({ closeModal, isOpen, route, provider }) => {
  const classes = useStyles();
  const [stateRoute, setStateRoute] = useState(route);

  const [loading, setLoading] = useState<boolean>(false);

  const [changed, setChanged] = useState(false);
  const [isEditing, setEditing] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { hasValidity, isValid, validityMessage } = getValidityInfo(route.validity);

  useEffect(() => {
    const difference = diff(omit(omittedField)(route), omit(omittedField)(stateRoute));
    const isChanged = keys(difference).length > 0;
    setChanged(isChanged);
  }, [route, stateRoute]);

  const handleChangeActive = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await activateRoute(provider.id, ProviderRoutesType.AUTOMATIC, route.id, event.target.checked);
  };

  const handleSave = async () => {
    setLoading(true);
    setEditing(false);
    await updateRoute(provider.id, {
      ...route,
      ...stateRoute,
      active: false,
    });
    setLoading(false);
  };

  const handleDeleteRoute = async () => {
    setLoading(true);
    await deleteLandTransportRoute(provider.id, route.id);
    setLoading(false);
    setIsDeleteDialogOpen(false);
    closeModal();
  };

  const handleCityInput = (value: City | Country | null, path: keyof Destination) => {
    setStateRoute(prevState => {
      let newOrigin = prevState.origin && value ? prevState.origin : ({} as Destination);
      newOrigin = set(path, value)(newOrigin);
      return {
        ...prevState,
        origin: newOrigin,
      };
    });
  };

  return (
    <Dialog
      open={isOpen}
      fullScreen
      onClose={closeModal}
      TransitionComponent={Transition}
      TransitionProps={{ mountOnEnter: true }}
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <Box width={'100%'} display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Typography variant={'h3'} color={'inherit'}>
                {`${provider.name} - Semi Automatic Route`}
              </Typography>
            </Box>
            <IconButton onClick={closeModal} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Container>
        <DialogTitle disableTypography>
          <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
            <Status
              editing={isEditing}
              active={route.active}
              disabled={!isValid}
              disabledMessage={validityMessage}
              handleChangeActive={handleChangeActive}
            />
            <ActionButtons
              editing={isEditing}
              handleEdit={() => setEditing(true)}
              handleCancel={() => {
                setStateRoute(route);
                setEditing(false);
              }}
              handleDelete={() => setIsDeleteDialogOpen(true)}
              showSaveButton={changed}
              handleSave={handleSave}
              loading={loading}
              title={'Save changes'}
            />
          </Box>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box display="flex" flexDirection="column" width={'100%'} style={{ gap: '16px' }}>
            <SectionWithTitle title="General info">
              <Box display="flex" flexDirection="column" style={{ gap: theme.spacing(5) }}>
                <Box display="flex" alignItems="center" style={{ gap: theme.spacing(5) }}>
                  <Box>
                    <InfoBoxItem label1={'Created At'} label2={<DateFormattedText date={route.createdAt} />} />
                  </Box>
                  <Box>
                    <InfoBoxItem label1={'Last Updated'} label2={<DateFormattedText date={route.updatedAt} />} />
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" style={{ gap: theme.spacing(10) }}>
                  <Box>
                    <InfoBoxItem
                      title={'Origin'}
                      titleVariant={'h5'}
                      label1={
                        <EditableTextItem
                          editing={isEditing}
                          value={
                            stateRoute.origin?.city?.name && stateRoute.origin?.country?.name
                              ? `${stateRoute.origin?.city.name}, ${stateRoute.origin?.country.name}`
                              : 'Not defined'
                          }
                          Element={
                            <CityInput isEditing={isEditing} onSelect={handleCityInput} origin={stateRoute.origin} />
                          }
                        />
                      }
                    />
                  </Box>
                  <ArrowForward />
                  <Box>
                    <InfoBoxItem
                      title={'Destination'}
                      titleVariant={'h5'}
                      label1={
                        <WithSelectedRoutesPopover
                          show={!isEditing && route.selectedRoutes.length > 0}
                          selectedRoutes={route.selectedRoutes}
                        >
                          <RoutesMultiInput isEditing={isEditing} startingDestination={stateRoute.origin} />
                        </WithSelectedRoutesPopover>
                      }
                    />
                  </Box>
                  <Box width={'15%'}>
                    <InfoBoxItem
                      title={'Transport Mode'}
                      titleVariant={'h5'}
                      label1={
                        <EditableTextItem
                          editing={isEditing}
                          value={stateRoute.transportMode || 'Not defined'}
                          Element={
                            <TransportModeInput
                              label={''}
                              value={stateRoute.transportMode}
                              onChange={transportMode =>
                                setStateRoute(prevState => set('transportMode', transportMode)(prevState))
                              }
                            />
                          }
                        />
                      }
                    />
                  </Box>
                </Box>
              </Box>
            </SectionWithTitle>
            <Validity
              validity={route.validity}
              validityState={stateRoute.validity}
              handleChange={newValidity => setStateRoute(prev => ({ ...prev, validity: newValidity }))}
              editing={isEditing}
              hasValidity={hasValidity}
            />
            <Description
              description={route.description}
              descriptionState={stateRoute.description}
              editing={isEditing}
              handleChange={newDescription => setStateRoute(prev => ({ ...prev, description: newDescription }))}
            />
          </Box>
        </DialogContent>
      </Container>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        label={'Please confirm route deletion'}
        handleConfirm={handleDeleteRoute}
        handleClose={() => setIsDeleteDialogOpen(false)}
        description={`Are you sure you want delete this route?`}
        loading={loading}
      />
    </Dialog>
  );
};

const usePopoverStyles = makeStyles(() => ({
  popover: {
    pointerEvents: 'none',
  },
  popoverContent: {
    pointerEvents: 'auto',
  },
}));

interface PopoverProps {
  selectedRoutes: RouteFromCity[];
  show: boolean;
}

const WithSelectedRoutesPopover: React.FC<PopoverProps> = ({ children, show, selectedRoutes }) => {
  const classes = usePopoverStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  return (
    <Box onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
      <Box aria-owns={open ? 'mouse-over-popover' : undefined} aria-haspopup="true">
        {children}
      </Box>
      <Popover
        id="mouse-over-popover"
        className={classes.popover}
        classes={{
          paper: classes.popoverContent,
        }}
        open={show ? open : false}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <SelectedRoutesCollection selectedRoutes={selectedRoutes} />
      </Popover>
    </Box>
  );
};

interface SelectedRoutesCollectionProps {
  selectedRoutes: RouteFromCity[];
}

const SelectedRoutesCollection: React.FC<SelectedRoutesCollectionProps> = ({ selectedRoutes }) => {
  const groupedByCountryCodes = groupBy(selectedRoutes, 'countryCode') as Dictionary<RouteFromCity[]>;
  const groupedByCountryCodesKeys = Object.keys(groupedByCountryCodes);

  console.log({ groupedByCountryCodes, groupedByCountryCodesKeys });
  return (
    <Box display={'flex'} flexDirection={'column'}>
      {groupedByCountryCodesKeys.map(key => (
        <SectionWithTitle key={key} title={getOr(key, key, CountryCodes)}>
          <Grid container spacing={1}>
            {groupedByCountryCodes[key].map(city => (
              <Grid key={city.id} item xs={2}>
                <Typography>{city.name}</Typography>
              </Grid>
            ))}
          </Grid>
        </SectionWithTitle>
      ))}
    </Box>
  );
};

export default SemiAutomaticRouteDialog;
