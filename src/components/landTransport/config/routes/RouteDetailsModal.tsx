import React, { useState } from 'react';
import {
  Box,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  List,
  Paper,
  Switch,
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

const useStyles = makeStyles((theme: Theme) => ({
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

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ChecklistItemValueDocument>();

  const versionDocs = useRouteVersionDocs(provider.id, route.version);

  const { saveFiles, deleteFiles } = useSaveFiles(`land-transport-config/routes/versions/${provider.id}`);

  const handleClose = (event: React.MouseEvent<unknown>) => {
    event.stopPropagation();
    setOpen(false);
  };

  const handleChangeActive = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await updateRoute(provider.id, { ...route, active: event.target.checked });
    await deactivateOthers(provider.id, route.version);
  };

  const handleDeleteDocument = async (item: ChecklistItemValueDocument) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeletion = async () => {
    if (itemToDelete) {
      await deleteVersionDocument(provider.id, route.version, itemToDelete.id);
      await updateRoute(provider.id, route);
      await deleteFiles([itemToDelete.url]);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle disableTypography>
        <Box display={'flex'} alignItems={'baseLine'}>
          <Box>
            <InfoBoxItem
              title={route.version}
              titleVariant={'h4'}
              label1={'Last updated'}
              label2={<DateFormattedText date={route.updatedAt.toDate()} />}
            />
          </Box>
          <Box display={'flex'} alignItems={'center'}>
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
        </Box>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box display={'flex'} flexDirection={'column'} width={'100%'}>
          <CardContent component={Paper} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box width={'100%'}>
              <Typography variant={'h4'}>Version Documents</Typography>
              <List>
                {versionDocs.map((item: ChecklistItemValueDocument) => (
                  <InternalStorageItem key={`${item.storedName}`} item={item} handleDelete={handleDeleteDocument} />
                ))}
              </List>
            </Box>
            <Tooltip title={'Upload more files'}>
              <IconButton aria-label="filter list" onClick={() => setIsAddDialogOpen(true)}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </CardContent>
        </Box>
      </DialogContent>
      <RoutesFileUploadDialog
        provider={provider}
        route={route}
        isOpen={isAddDialogOpen}
        handleClose={() => setIsAddDialogOpen(false)}
        saveFiles={saveFiles}
      />
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        label={'Please confirm deletion'}
        handleConfirm={handleConfirmDeletion}
        handleClose={() => setIsDeleteDialogOpen(false)}
        description={`Are you sure you want remove this file?`}
      />
    </Dialog>
  );
};

export default RouteDetailsModal;
