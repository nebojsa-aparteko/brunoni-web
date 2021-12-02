import React, { useCallback, useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  CircularProgress,
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
import {
  AutomaticProviderRoute,
  ProviderRoutesType,
  RouteValidity,
} from '../../../../model/land-transport/providers/ProviderRoutes';
import useRouteVersionDocs from '../../../../hooks/useRouteVersionDocs';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';
import { ChecklistItemValueDocument } from '../../../bookings/checklist/ChecklistItemModel';
import InternalStorageItem from '../../../bookings/InternalStorageItem';
import InfoBoxItem from '../../../InfoBoxItem';
import DateFormattedText from '../../../DateFormattedText';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import AddIcon from '@material-ui/icons/Add';
import { saveRouteFilesToFirestore } from './RoutesFileUploadDialog';
import useSaveFiles from '../../../../hooks/useSaveFiles';
import firebase from '../../../../firebase';
import ConfirmationDialog from '../../../ConfirmationDialog';
import theme from '../../../../theme';
import { Transition } from './ManualRouteDialog';
import Container from '../../../Container';
import DateRangeInput from '../../../inputs/DateRangeInput';
import SectionWithTitle from '../../../SectionWithTitle';
import SaveButton, { CancelButton, SaveButtonProps } from '../../../SaveButton';
import { diff } from 'deep-object-diff';
import { keys } from 'lodash/fp';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { format } from 'date-fns';
import { useDropzone } from 'react-dropzone';
import useUser from '../../../../hooks/useUser';
import { deleteRoutes } from './RoutesTable';

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

const activateRoute = async (providerId: string, currentRouteVersion: string, active: boolean) => {
  const batch = firebase.firestore().batch();
  //Deactivate others only if activating current
  if (active) {
    (
      await firebase
        .firestore()
        .collection(`land-transport-config/${providerId}/routes`)
        .where('type', '==', ProviderRoutesType.AUTOMATIC)
        .where('active', '==', true)
        .get()
    ).docs.map(r => {
      return batch.set(r.ref, { active: false }, { merge: true });
    });
  }
  //Set current
  batch.set(
    firebase
      .firestore()
      .collection(`land-transport-config/${providerId}/routes`)
      .doc(currentRouteVersion),
    { active },
    { merge: true },
  );
  await batch.commit();
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
  const [validityState, setValidityState] = useState(route.validity);

  const [changed, setChanged] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { deleteFiles } = useSaveFiles(`land-transport-config/routes/versions/${provider.id}`);

  useEffect(() => {
    const validityDifference = diff(route.validity, validityState);
    const isChanged = keys(validityDifference).length > 0 || route.description !== descriptionState;
    setChanged(isChanged);
  }, [validityState, descriptionState, route.validity, route.description]);

  const handleClose = (event: React.MouseEvent<unknown>) => {
    event.stopPropagation();
    setOpen(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setEditing(false);
    await updateRoute(provider.id, {
      ...route,
      description: descriptionState,
      validity: validityState,
      active: false,
    });
    setLoading(false);
  };

  const handleChangeActive = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await activateRoute(provider.id, route.version, event.target.checked);
  };

  const handleDeleteVersion = async () => {
    await deleteRoutes(provider, [route.version], deleteFiles);
    setIsDeleteDialogOpen(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} fullScreen onClose={handleClose} TransitionComponent={Transition}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <Box width={'100%'} display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Typography variant={'h3'} color={'inherit'}>
                {`${provider.name} - Automatic Route`}
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
          <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
            <Status editing={editing} active={route.active} handleChangeActive={handleChangeActive} />
            <ActionButtons
              editing={editing}
              handleEdit={() => setEditing(true)}
              handleCancel={() => {
                setValidityState(route.validity);
                setDescriptionState(route.description);
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
          <Box display={'flex'} flexDirection={'column'} width={'100%'} style={{ gap: '16px' }}>
            <SectionWithTitle title="General Info">
              <Box display={'flex'} flexDirection={'column'}>
                <InfoBoxItem title={route.version} titleVariant={'h2'} />
                <Box display="flex" alignItems="center">
                  <Box pl={0} p={2}>
                    <InfoBoxItem label1={'Created At'} label2={<DateFormattedText date={route.createdAt} />} />
                  </Box>
                  <Box p={2}>
                    <InfoBoxItem label1={'Last Updated'} label2={<DateFormattedText date={route.updatedAt} />} />
                  </Box>
                </Box>
              </Box>
            </SectionWithTitle>
            <SectionWithTitle title="Validity">
              {editing ? (
                <DateRangeInput
                  onChange={dateRange => setValidityState(dateRange as RouteValidity)}
                  value={validityState}
                />
              ) : (
                <Typography>
                  {`${format(route.validity.startDate, 'dd-MM-yyyy')} - ${format(
                    route.validity.endDate,
                    'dd-MM-yyyy',
                  )}`}
                </Typography>
              )}
            </SectionWithTitle>
            <SectionWithTitle title="Description">
              {editing ? (
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
              ) : (
                <Typography>{route.description !== '' ? route.description : 'No description'}</Typography>
              )}
            </SectionWithTitle>
            <DocumentsContainer route={route} provider={provider} editing={editing} />
          </Box>
        </DialogContent>
      </Container>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        label={'Please confirm version deletion'}
        handleConfirm={handleDeleteVersion}
        handleClose={() => setIsDeleteDialogOpen(false)}
        description={`Are you sure you want delete this version?`}
        loading={loading}
      />
    </Dialog>
  );
};

interface StatusProps {
  editing: boolean;
  active: boolean;
  handleChangeActive: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Status: React.FC<StatusProps> = ({ editing, active, handleChangeActive }) => {
  return (
    <Box style={{ gap: '16px' }} display={'flex'} alignItems={'center'}>
      {active ? (
        <Box style={{ gap: '8px' }} display="flex" alignItems="center">
          <FiberManualRecordIcon style={{ fill: 'lightgreen' }} />
          <Typography>Active</Typography>
        </Box>
      ) : (
        <Box style={{ gap: '8px' }} display="flex" alignItems="center">
          <FiberManualRecordIcon color={'error'} />
          <Typography>Inactive</Typography>
        </Box>
      )}
      {editing ? (
        <FormGroup>
          <FormControlLabel
            control={
              <Switch inputProps={{ 'aria-label': 'controlled' }} checked={active} onChange={handleChangeActive} />
            }
            label={''}
          />
        </FormGroup>
      ) : null}
    </Box>
  );
};

interface ActionButtonsProps extends SaveButtonProps {
  editing: boolean;
  handleEdit: () => void;
  handleCancel: () => void;
  handleDelete: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  editing,
  showSaveButton,
  loading,
  handleSave,
  handleEdit,
  handleCancel,
  handleDelete,
}) => {
  return (
    <Box display="flex" alignItems="center">
      {editing ? (
        <Box display="flex" alignItems="center" style={{ gap: '16px' }}>
          <IconButton onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
          <SaveButton
            showSaveButton={showSaveButton}
            handleSave={handleSave}
            loading={loading}
            title={'Save changes'}
          />
          <CancelButton handleCancel={handleCancel} />
        </Box>
      ) : loading ? (
        <CircularProgress style={{ margin: '3px' }} />
      ) : (
        <IconButton onClick={handleEdit}>
          <EditIcon />
        </IconButton>
      )}
    </Box>
  );
};

const useDocumentsContainerStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    '&:focus': {
      outline: 'none',
    },
  },
  dropZone: {
    border: '1px dashed #ccc',
    cursor: 'pointer',
    borderColor: '#999',
    '&:focus': {
      outline: 'none',
    },
  },
}));

interface DocumentsContainerProps {
  route: AutomaticProviderRoute;
  provider: ProviderEntity;
  editing: boolean;
}

const DocumentsContainer: React.FC<DocumentsContainerProps> = ({ route, provider, editing }) => {
  const classes = useDocumentsContainerStyles();

  const [loading, setLoading] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<ChecklistItemValueDocument>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const versionDocs = useRouteVersionDocs(provider.id, route.version);
  const { saveFiles, deleteFiles } = useSaveFiles(`land-transport-config/routes/versions/${provider.id}`);

  const [, userRecord] = useUser();

  const handleSaveDocuments = useCallback(
    async (files: File[]) => {
      setLoading(true);
      const documents = (await saveFiles(files)) as ChecklistItemValueDocument[];
      const values = documents.map(
        item =>
          ({
            uploadedBy: userRecord,
            uploadedAt: new Date(),
            name: item.name,
            url: item.url,
            storedName: item.storedName,
            isInternal: false,
          } as ChecklistItemValueDocument),
      );
      values.map(async value => await saveRouteFilesToFirestore(provider, route.version, value));
      await updateRoute(provider.id, {
        ...route,
        active: false,
      });
      setLoading(false);
    },
    [provider, route, saveFiles, userRecord],
  );

  const handleDeleteDocument = async (item: ChecklistItemValueDocument) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDocumentDeletion = async () => {
    if (itemToDelete) {
      setLoading(true);
      await deleteVersionDocument(provider.id, route.version, itemToDelete.id);
      await updateRoute(provider.id, {
        ...route,
        active: false,
      });
      await deleteFiles([itemToDelete.url]);
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      await handleSaveDocuments(acceptedFiles);
    },
    [handleSaveDocuments],
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => onDrop(acceptedFiles),
    noClick: true,
    disabled: !editing,
  });

  return (
    <SectionWithTitle
      title="Version Documents"
      ActionElement={
        loading ? (
          <CircularProgress />
        ) : editing ? (
          <Tooltip title={'Upload Documents'}>
            <IconButton onClick={open}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        ) : null
      }
    >
      <Box
        {...getRootProps()}
        className={isDragActive ? classes.dropZone : classes.root}
        border={editing ? '1px dashed #ccc' : ''}
        p={5}
      >
        <input {...getInputProps()} />
        {versionDocs.length > 0 ? (
          <List style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            {versionDocs.map((item: ChecklistItemValueDocument) => (
              <Box key={`${item.storedName}`} component={Paper} m={theme.spacing(0.1)} width={'33%'}>
                <InternalStorageItem item={item} handleDelete={editing ? handleDeleteDocument : undefined} />
              </Box>
            ))}
          </List>
        ) : (
          <Typography>No documents</Typography>
        )}
      </Box>
      {editing && <Typography>Hint: You can drag & drop files over input</Typography>}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        label={'Please confirm document deletion'}
        handleConfirm={handleConfirmDocumentDeletion}
        handleClose={() => setIsDeleteDialogOpen(false)}
        description={`Are you sure you want remove this document?`}
        loading={loading}
      />
    </SectionWithTitle>
  );
};

export default RouteDetailsModal;
