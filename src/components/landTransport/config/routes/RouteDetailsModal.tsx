import React, { useCallback, useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  List,
  Paper,
  Switch,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { AutomaticProviderRoute } from '../../../../model/land-transport/providers/ProviderRoutes';
import useRouteVersionDocs from '../../../../hooks/useRouteVersionDocs';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';
import { ChecklistItemValueDocument } from '../../../bookings/checklist/ChecklistItemModel';
import InternalStorageItem from '../../../bookings/InternalStorageItem';
import InfoBoxItem from '../../../InfoBoxItem';
import DateFormattedText from '../../../DateFormattedText';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import AddIcon from '@material-ui/icons/Add';
import RoutesFileUploadDialog from './RoutesFileUploadDialog';
import useSaveFiles from '../../../../hooks/useSaveFiles';
import firebase from '../../../../firebase';
import ConfirmationDialog from '../../../ConfirmationDialog';
import ExtensionTables from '../ExtensionTables';
import theme from '../../../../theme';
import { Transition } from './ManualRouteDialog';
import Container from '../../../Container';
import DateRangeInput from '../../../inputs/DateRangeInput';
import SectionWithTitle from '../../../SectionWithTitle';
import SaveButton from '../../../SaveButton';
import { diff } from 'deep-object-diff';
import { keys, debounce } from 'lodash/fp';
import { DateRange } from '../../../daterangepicker/types';

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
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  validComponent: {
    '& > *': {
      marginRight: theme.spacing(1),
    },
  },
}));

const deactivateOthers = async (providerId: string, activeRouteVersion: string) => {
  (
    await firebase
      .firestore()
      .collection(`land-transport-config/${providerId}/routes`)
      .get()
  ).docs.forEach(d => {
    const route = d.data() as AutomaticProviderRoute;
    if (route.active && route.version !== activeRouteVersion) {
      d.ref.set({ active: false }, { merge: true });
    }
  });
};

const updateRoute = async (providerId: string, route: AutomaticProviderRoute) => {
  const updatedAt = firebase.firestore.Timestamp.fromDate(new Date());
  await firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/routes`)
    .doc(route.version)
    .set({ ...route, updatedAt }, { merge: true });
};

const deleteVersionDocument = async (providerId: string, routeVersion: string, documentId: string) =>
  await firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/routes/${routeVersion}/versionDocuments`)
    .doc(documentId)
    .delete();

interface Props {
  route: AutomaticProviderRoute;
  provider: ProviderEntity;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
}

const RouteDetailsModal: React.FC<Props> = ({ route, provider, open, setOpen }) => {
  const classes = useStyles();

  const [descriptionState, setDescriptionState] = useState(route.description);
  const [dateRangeState, setDateRangeState] = useState(route.dateRange);

  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ChecklistItemValueDocument>();

  const versionDocs = useRouteVersionDocs(provider.id, route.version);

  const { saveFiles, deleteFiles } = useSaveFiles(`land-transport-config/routes/versions/${provider.id}`);

  useEffect(() => {
    const dateRangeDifference = diff(route.dateRange, dateRangeState);
    const isChanged = keys(dateRangeDifference).length > 0 || route.description !== descriptionState;
    console.log(
      { desc: route.description, dateRange: route.dateRange },
      {
        descState: descriptionState,
        dateRangeSate: dateRangeState,
      },
    );
    setChanged(isChanged);
  }, [dateRangeState, descriptionState, route.dateRange, route.description]);

  const handleClose = (event: React.MouseEvent<unknown>) => {
    event.stopPropagation();
    setOpen(false);
  };

  const handleSave = async () => {
    setLoading(true);
    await updateRoute(provider.id, {
      ...route,
      description: descriptionState,
      dateRange: dateRangeState,
    });
    setLoading(false);
  };

  const handleChangeActive = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await updateRoute(provider.id, { ...route, active: event.target.checked });
    await deactivateOthers(provider.id, route.version);
  };

  const handleDeleteDocument = async (item: ChecklistItemValueDocument) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDocumentDeletion = async () => {
    if (itemToDelete) {
      await deleteVersionDocument(provider.id, route.version, itemToDelete.id);
      await updateRoute(provider.id, route);
      await deleteFiles([itemToDelete.url]);
      setIsDeleteDialogOpen(false);
    }
  };

  const dateRange: DateRange = {
    startDate: new Date(),
    endDate: new Date(),
  };

  return (
    <Dialog open={open} fullScreen onClose={handleClose} TransitionComponent={Transition}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <Box width={'100%'} display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Typography variant={'h3'} color={'inherit'}>
                Automatic Route
              </Typography>
            </Box>
            <IconButton onClick={handleClose} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Container>
        <DialogTitle disableTypography>
          <Box display={'flex'} alignItems={'baseLine'} justifyContent={'space-between'}>
            <Box>
              <InfoBoxItem title={route.version} titleVariant={'h2'} />
              <Box display="flex" alignItems="center" justifyContent={'space-between'}>
                <Box pl={0} p={2}>
                  <InfoBoxItem label1={'Created on'} label2={<DateFormattedText date={route.createdAt} />} />
                </Box>
                <Box p={2}>
                  <InfoBoxItem label1={'Last updated'} label2={<DateFormattedText date={route.updatedAt} />} />
                </Box>
              </Box>
            </Box>
            <Box>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      inputProps={{ 'aria-label': 'controlled' }}
                      checked={route.active}
                      onChange={handleChangeActive}
                    />
                  }
                  label={''}
                />
              </FormGroup>
              {route.active ? (
                <FiberManualRecordIcon style={{ fill: 'lightgreen' }} />
              ) : (
                <FiberManualRecordIcon color={'error'} />
              )}
            </Box>
            <Box style={{ opacity: changed ? 100 : 0 }}>
              <SaveButton handleSave={handleSave} loading={loading} title={'Save changes'} />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box display={'flex'} flexDirection={'column'} width={'100%'} style={{ gap: '16px' }}>
            <Box maxWidth={'50%'}>
              <SectionWithTitle title="Validity">
                <DateRangeInput
                  onChange={dateRange => setDateRangeState(dateRange)}
                  value={dateRangeState ? dateRangeState : dateRange}
                />
              </SectionWithTitle>
            </Box>
            <SectionWithTitle title="Description">
              <TextField
                placeholder="Write some description here..."
                variant="outlined"
                margin="dense"
                name="description"
                rows={8}
                multiline
                fullWidth
                value={descriptionState ? descriptionState : ''}
                onChange={e => setDescriptionState(e.target.value)}
              />
            </SectionWithTitle>
            <SectionWithTitle
              title="Version Documents"
              ActionElement={
                <Tooltip title={'Upload more Documents'}>
                  <IconButton aria-label="filter list" onClick={() => setIsAddDialogOpen(true)}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <List style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                {versionDocs.map((item: ChecklistItemValueDocument) => (
                  <Box key={`${item.storedName}`} component={Paper} m={theme.spacing(0.1)} width={'33%'}>
                    <InternalStorageItem item={item} handleDelete={handleDeleteDocument} />
                  </Box>
                ))}
              </List>
            </SectionWithTitle>
            <ExtensionTables providerId={provider.id} />
            <ExtensionTables providerId={provider.id} />
            <ExtensionTables providerId={provider.id} />
          </Box>
        </DialogContent>
      </Container>
      <RoutesFileUploadDialog
        provider={provider}
        route={route}
        isOpen={isAddDialogOpen}
        handleClose={() => setIsAddDialogOpen(false)}
        saveFiles={saveFiles}
      />
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        label={'Please confirm document deletion'}
        handleConfirm={handleConfirmDocumentDeletion}
        handleClose={() => setIsDeleteDialogOpen(false)}
        description={`Are you sure you want remove this document?`}
      />
    </Dialog>
  );
};

export default RouteDetailsModal;
