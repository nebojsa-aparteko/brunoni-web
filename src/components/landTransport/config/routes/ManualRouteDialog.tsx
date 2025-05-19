import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  TextField,
  Toolbar,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ArrowForward from '@material-ui/icons/ArrowForward';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';
import { TransitionProps } from '@material-ui/core/transitions';
import {
  getPriceRangeText,
  ManualProviderRouteEntity,
  ProviderRoutesType,
} from '../../../../model/land-transport/providers/ProviderRoutes';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';
import { keys, omit, set } from 'lodash/fp';
import { theme } from '../../../../theme';
import Container from '../../../Container';
import SectionWithTitle from '../../../SectionWithTitle';
import { ManualRouteTablePricing } from './ManualRouteShortView';
import ExtensionsContainer from '../extensions/ExtensionsContainer';
import useAPI from '../../../../hooks/useAPI';
import {
  ActionButtons,
  activateRoute,
  ConfirmationType,
  Description,
  getValidityInfo,
  Status,
  updateRoute,
  Validity,
} from './RouteDetailsModal';
import { diff } from 'deep-object-diff';
import InfoBoxItem from '../../../InfoBoxItem';
import DateFormattedText from '../../../DateFormattedText';
import ConfirmationDialog from '../../../ConfirmationDialog';
import { deleteRoute } from './RoutesTable';
import TransportModeInput from '../../../inputs/TransportModeInput';
import { TypographyProps } from '@material-ui/core/Typography';
import { EquipmentControlContainerTypes } from '../../../../model/EquipmentControl';

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
  route: ManualProviderRouteEntity;
  provider: ProviderEntity;
}

const omittedField = ['active', 'updatedAt'];
const equType = (type: keyof typeof EquipmentControlContainerTypes) => {
  switch (type) {
    case '22G1':
      return { equSize: "20'", equGroup: 'GENERAL PURPOSE' };
    case '42G1':
      return { equSize: "40'", equGroup: 'GENERAL PURPOSE' };
    case '45G1':
      return { equSize: "40'", equGroup: 'GENERAL PURPOSE' };
    case '22R1':
      return { equSize: "20'", equGroup: 'REEFER' };
    case '45R1':
      return { equSize: "40'", equGroup: 'REEFER' };
    case '22U1':
      return { equSize: "20'", equGroup: 'SPECIAL' };
    case '42U1':
      return { equSize: "40'", equGroup: 'SPECIAL' };
    case '45U1':
      return { equSize: "40'", equGroup: 'SPECIAL' };
    default:
      return undefined;
  }
};

const ManualRouteDialog: React.FC<Props> = ({ closeModal, isOpen, route, provider }) => {
  const classes = useStyles();
  const [stateRoute, setStateRoute] = useState(route);

  const [changed, setChanged] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationType, setConfirmationType] = useState<ConfirmationType | null>(null);

  const { post } = useAPI();

  useEffect(() => {
    const difference = diff(omit(omittedField)(route), omit(omittedField)(stateRoute));
    const isChanged = keys(difference).length > 0;
    setChanged(isChanged);
  }, [route, stateRoute]);

  const handleSave = async () => {
    setLoading(true);
    setEditing(false);
    //Manual route can have multiple active
    await updateRoute(provider.id, {
      ...stateRoute,
      active: false,
    });
    setLoading(false);
  };

  const handleChangeActive = async (event: React.ChangeEvent<HTMLInputElement>) => {
    //Manual route can have multiple active
    await updateRoute(provider.id, {
      ...stateRoute,
      active: event.target.checked,
    });
  };

  const handleDeleteRoute = async () => {
    setLoading(true);
    await deleteManualRoutes(provider, [route.id]);
    setLoading(false);
    setIsConfirmationDialogOpen(false);
    closeModal();
  };

  const handleCancelConfirmation = async () => {
    setIsConfirmationDialogOpen(false);
  };

  const handleConfirmDialog = async () => {
    setLoading(true);
    switch (confirmationType) {
      case ConfirmationType.UPDATE:
        await activateRoute(provider.id, ProviderRoutesType.MANUAL, route.id, true);
        break;
      case ConfirmationType.DELETE:
        await handleDeleteRoute();
        break;
    }
    setLoading(false);
    setIsConfirmationDialogOpen(false);
  };

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const key = event.target?.name;
    const value = event.target.value;
    const type = event.target.type;
    key &&
      setStateRoute((prevState: any) => set(key, type === 'number' ? +value : value)(prevState));
  };
  const handleSelectChange = (event: ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = event.target?.name;
    const value = event.target?.value;
    if (name && value) {
      setStateRoute(prevState => set(name, value)(prevState));
    }
  };

  const { hasValidity, isValid, validityMessage } = getValidityInfo(route.validity);

  return (
    <Dialog open={isOpen} fullScreen onClose={closeModal} TransitionComponent={Transition}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <Box width={'100%'} display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Typography variant={'h3'} color={'inherit'}>
                {`${provider.name} - Manual Route`}
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
              handleDelete={() => {
                setConfirmationMessage('Are you sure you want delete this route?');
                setConfirmationType(ConfirmationType.DELETE);
                setIsConfirmationDialogOpen(true);
              }}
              showSaveButton={changed}
              handleSave={handleSave}
              loading={loading}
              title={'Save changes'}
            />
          </Box>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Button
            variant="outlined"
            color="primary"
            onClick={async () => {
              await post('landTransport/handleRoute', {
                body: Object.entries(route.pricePerContainer).map(([ctgType, price]) => ({
                  fromLocationName: route.origin,
                  toLocationName: route.destination,
                  curr: route.currency,
                  rate: price.value,
                  transportMode: route.transportMode,
                  routeId: route.id,
                  active: false,
                  provider: provider.id,
                  weightRangeMin: 0,
                  weightRangeMax: 16.5,
                  weightRangeUnit: 'T',
                  ...equType(ctgType as keyof typeof EquipmentControlContainerTypes),
                })),
                type: 'create',
              });
            }}
          >
            Save into db
          </Button>
          <Box display="flex" flexDirection="column" width={'100%'} style={{ gap: '16px' }}>
            <SectionWithTitle
              title="General info"
              ActionElement={
                <Typography variant="h4">
                  {stateRoute.priceRange ? getPriceRangeText(stateRoute.priceRange) : 'Not defined'}
                </Typography>
              }
            >
              <Box display="flex">
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  flex={1}
                >
                  <Box display="flex" flexDirection="column" style={{ gap: theme.spacing(5) }}>
                    <Box display="flex" alignItems="center" style={{ gap: theme.spacing(5) }}>
                      <Box>
                        <InfoBoxItem
                          label1={'Created At'}
                          label2={<DateFormattedText date={route.createdAt} />}
                        />
                      </Box>
                      <Box>
                        <InfoBoxItem
                          label1={'Last Updated'}
                          label2={<DateFormattedText date={route.updatedAt} />}
                        />
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
                              value={stateRoute.origin}
                              Element={
                                <TextField
                                  variant="outlined"
                                  margin="dense"
                                  name={'origin'}
                                  fullWidth
                                  value={stateRoute.origin}
                                  onChange={handleInputChange}
                                />
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
                            <EditableTextItem
                              editing={isEditing}
                              value={stateRoute.destination}
                              Element={
                                <TextField
                                  variant="outlined"
                                  margin="dense"
                                  name={'destination'}
                                  fullWidth
                                  value={stateRoute.destination}
                                  onChange={handleInputChange}
                                />
                              }
                            />
                          }
                        />
                      </Box>
                      <Box width={'30%'}>
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
                                    setStateRoute(prevState =>
                                      set('transportMode', transportMode)(prevState),
                                    )
                                  }
                                />
                              }
                            />
                          }
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </SectionWithTitle>
            <SectionWithTitle title={'Pricing'}>
              <ManualRouteTablePricing
                route={stateRoute}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                isEditing={isEditing}
              />
            </SectionWithTitle>
            <Validity
              validity={route.validity}
              validityState={stateRoute.validity}
              handleChange={newValidity =>
                setStateRoute(prev => ({ ...prev, validity: newValidity }))
              }
              editing={isEditing}
              hasValidity={hasValidity}
            />
            <Description
              description={route.description}
              descriptionState={stateRoute.description}
              editing={isEditing}
              handleChange={newDescription =>
                setStateRoute(prev => ({ ...prev, description: newDescription }))
              }
            />
            <SectionWithTitle title="Extensions">
              <ExtensionsContainer provider={provider} routeId={route.id} />
            </SectionWithTitle>
          </Box>
        </DialogContent>
      </Container>
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        label={'Please confirm'}
        handleConfirm={handleConfirmDialog}
        handleClose={handleCancelConfirmation}
        description={confirmationMessage}
        loading={loading}
      />
    </Dialog>
  );
};

const deleteManualRoutes = async (provider: ProviderEntity, routeIds: string[]) => {
  return Promise.all(
    routeIds.map(async id => {
      await deleteRoute(provider.id, id);
    }),
  );
};

interface EditableTextItemProps {
  value: string;
  editing: boolean;
  Element: React.ReactElement | null;
  typographyProps?: TypographyProps;
}

export const EditableTextItem: React.FC<EditableTextItemProps> = ({
  value,
  editing,
  Element,
  typographyProps = true,
}) => {
  return editing ? Element : <Typography {...typographyProps}>{value}</Typography>;
};

export const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default ManualRouteDialog;
