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
import ClearIcon from '@material-ui/icons/Clear';
import { makeStyles, Theme } from '@material-ui/core/styles';
import {
  AutomaticProviderRouteEntity,
  ManualProviderRouteEntity,
  ProviderRoutesType,
  RouteValidity,
  SemiAutomaticProviderRouteEntity,
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
import { format, isAfter, isFuture, isPast } from 'date-fns';
import { useDropzone } from 'react-dropzone';
import useUser from '../../../../hooks/useUser';
import { isNil } from 'lodash';
import { deleteAutomaticRoutes } from './RoutesTable';
import { hasActiveRoute } from '../../../../api/landTransportConfig';

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

export const activateRoute = async (
  providerId: string,
  routeType: ProviderRoutesType,
  currentRouteId: string,
  active: boolean,
) => {
  const updatedAt = new Date();
  const batch = firebase.firestore().batch();
  //Deactivate others only if activating current
  if (active) {
    (
      await firebase
        .firestore()
        .collection(`land-transport-config/${providerId}/routes`)
        .where('type', '==', routeType)
        .where('active', '==', true)
        .get()
    ).docs.map(r => {
      return batch.set(r.ref, { active: false, updatedAt }, { merge: true });
    });
  }
  //Set current
  batch.set(
    firebase
      .firestore()
      .collection(`land-transport-config/${providerId}/routes`)
      .doc(currentRouteId),
    { active },
    { merge: true },
  );
  await batch.commit();
};

export const updateRoute = async (
  providerId: string,
  route: AutomaticProviderRouteEntity | ManualProviderRouteEntity | SemiAutomaticProviderRouteEntity,
) => {
  const updatedAt = new Date();
  await firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/routes`)
    .doc(route.id)
    .set({ ...route, updatedAt }, { merge: true });
};

const deleteVersionDocument = async (providerId: string, routeVersion: string, documentId: string) =>
  await firebase
    .firestore()
    .collection(`land-transport-config/${providerId}/routes/${routeVersion}/versionDocuments`)
    .doc(documentId)
    .delete();

export const getValidityInfo = (validity: RouteValidity | null) => {
  const hasValidity = !isNil(validity) && !isNil(validity.startDate) && !isNil(validity.endDate);
  const isValid = hasValidity && isPast(validity!.startDate) && isFuture(validity!.endDate);
  const validityMessage = !hasValidity
    ? 'You must provide validity before activating'
    : !isValid
    ? isFuture(validity!.startDate)
      ? `This route is not valid (becomes valid at ${format(validity!.startDate, 'dd-MM-yyyy HH:mm')})`
      : isPast(validity!.endDate)
      ? `This route is expired (expired at ${format(validity!.endDate, 'dd-MM-yyyy HH:mm')})`
      : ''
    : '';
  return {
    hasValidity,
    isValid,
    validityMessage,
  };
};

export enum ConfirmationType {
  DELETE = 'DELETE',
  UPDATE = 'UPDATE',
}

interface Props {
  route: AutomaticProviderRouteEntity;
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

  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationType, setConfirmationType] = useState<ConfirmationType | null>(null);

  const { deleteFiles } = useSaveFiles(`land-transport-config/routes/versions/${provider.id}`);

  useEffect(() => {
    const validityDifference = route.validity ? diff(route.validity, validityState ? validityState : {}) : {};
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
    const validityDifference = route.validity ? diff(route.validity, validityState ? validityState : {}) : {};
    if (keys(validityDifference).length === 0) return setLoading(false);

    const { activate, activationMessage } = await handleActivationLogic(
      provider.id,
      route.id,
      ProviderRoutesType.AUTOMATIC,
      validityState,
    );
    if (activate) {
      setConfirmationMessage(activationMessage!);
      setConfirmationType(ConfirmationType.UPDATE);
      setIsConfirmationDialogOpen(true);
    }
    setLoading(false);
  };

  const handleChangeActive = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await activateRoute(provider.id, ProviderRoutesType.AUTOMATIC, route.id, event.target.checked);
  };

  const handleDeleteVersion = async () => {
    setLoading(true);
    await deleteAutomaticRoutes(provider, [route.id], deleteFiles);
    setLoading(false);
    setIsConfirmationDialogOpen(false);
    setOpen(false);
  };

  const handleCancelConfirmation = async () => {
    setIsConfirmationDialogOpen(false);
  };

  const handleConfirmDialog = async () => {
    setLoading(true);
    switch (confirmationType) {
      case ConfirmationType.UPDATE:
        await activateRoute(provider.id, ProviderRoutesType.AUTOMATIC, route.id, true);
        break;
      case ConfirmationType.DELETE:
        await handleDeleteVersion();
        break;
    }
    setLoading(false);
    setIsConfirmationDialogOpen(false);
  };

  const { hasValidity, isValid, validityMessage } = getValidityInfo(route.validity);

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
            <Status
              editing={editing}
              active={route.active}
              disabled={!isValid}
              disabledMessage={validityMessage}
              handleChangeActive={handleChangeActive}
            />
            <ActionButtons
              editing={editing}
              handleEdit={() => setEditing(true)}
              handleCancel={() => {
                setValidityState(route.validity);
                setDescriptionState(route.description);
                setEditing(false);
              }}
              handleDelete={() => {
                setConfirmationMessage('Are you sure you want delete this version?');
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
            <Validity
              validity={route.validity}
              validityState={validityState}
              handleChange={setValidityState}
              editing={editing}
              hasValidity={hasValidity}
            />
            <Description
              description={route.description}
              descriptionState={descriptionState}
              editing={editing}
              handleChange={setDescriptionState}
            />
            <DocumentsContainer route={route} provider={provider} editing={editing} />
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

interface DescriptionProps {
  description: string;
  descriptionState: string;
  editing: boolean;
  handleChange: (newDescription: string) => void;
}

export const Description: React.FC<DescriptionProps> = ({ editing, descriptionState, description, handleChange }) => {
  return (
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
          value={descriptionState}
          onChange={e => handleChange(e.target.value)}
        />
      ) : (
        <Typography>{description !== '' ? description : 'No description'}</Typography>
      )}
    </SectionWithTitle>
  );
};

export const handleActivationLogic = async (
  providerId: string,
  routeId: string,
  routeType: ProviderRoutesType,
  validity: RouteValidity | null,
): Promise<{
  activate: boolean;
  activationMessage?: string;
}> => {
  if (!validity) return { activate: false };

  const isCurrentlyValid = isPast(validity.startDate) && isFuture(validity.endDate);
  if (!isCurrentlyValid) return { activate: false };

  const { hasActive, activeRoute } = await hasActiveRoute(providerId, routeType);
  if (hasActive) {
    const activeHasLongerPeriod = isAfter(activeRoute!.validity!.endDate, validity.endDate);
    if (activeHasLongerPeriod) return { activate: false }; //keep same active
    return {
      activate: true,
      activationMessage: `This route has longer end date (ends at: ${format(validity.endDate, 'dd-MM-yyyy')})
       than currently active route (ends at: ${format(
         activeRoute!.validity!.endDate,
         'dd-MM-yyyy',
       )}). Would you like to activate current route instead?`,
    };
  } else {
    return {
      activate: true,
      activationMessage: `There is no active route. Would you like to activate current?`,
    };
  }
};

interface ValidityProps {
  validity: RouteValidity | null;
  validityState: RouteValidity | null;
  handleChange: (newValidity: RouteValidity | null) => void;
  editing: boolean;
  hasValidity: boolean;
}

export const Validity: React.FC<ValidityProps> = ({ validity, validityState, handleChange, editing, hasValidity }) => {
  return (
    <SectionWithTitle
      title="Validity"
      ActionElement={
        validityState && editing ? (
          <Tooltip title={'Clear Validity'} placement={'top'}>
            <IconButton onClick={() => handleChange(null)}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        ) : null
      }
    >
      {editing ? (
        <DateRangeInput
          onChange={dateRange => handleChange(dateRange as RouteValidity)}
          value={validityState ? validityState : { startDate: undefined, endDate: undefined }}
        />
      ) : (
        <Typography>
          {hasValidity
            ? `${format(validity!.startDate, 'dd-MM-yyyy')} - ${format(validity!.endDate, 'dd-MM-yyyy')}`
            : 'Not defined'}
        </Typography>
      )}
    </SectionWithTitle>
  );
};

interface StatusProps {
  editing: boolean;
  active: boolean;
  handleChangeActive: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export const Status: React.FC<StatusProps> = ({ editing, active, disabled, disabledMessage, handleChangeActive }) => {
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
          <Box display={'flex'} alignItems={'baseline'}>
            <FormControlLabel
              control={
                <Switch inputProps={{ 'aria-label': 'controlled' }} checked={active} onChange={handleChangeActive} />
              }
              disabled={disabled}
              label={''}
            />
            {disabled && disabledMessage && <Typography color={'error'}>{disabledMessage}</Typography>}
          </Box>
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

export const ActionButtons: React.FC<ActionButtonsProps> = ({
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
  route: AutomaticProviderRouteEntity;
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
          <Tooltip title={'Upload Documents'} placement={'top'}>
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
