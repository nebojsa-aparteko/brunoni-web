import firebase from 'firebase';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';
import { AutomaticProviderRoute, ProviderRoutesType } from '../../../../model/land-transport/providers/ProviderRoutes';
import { ChecklistItemValueDocument } from '../../../bookings/checklist/ChecklistItemModel';
import React, { useState } from 'react';
import useUser from '../../../../hooks/useUser';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import DropZoneArea from '../../../dropzone/DropZoneArea';

const getRouteVersion = async (providerName: string) => {
  return (
    await firebase
      .database()
      .ref(`/land-transport-versions/${providerName}/version`)
      .get()
  ).val() as number;
};

export const incrementRouteVersion = async (providerName: string) => {
  await firebase
    .database()
    .ref(`/land-transport-versions/${providerName}/version`)
    .transaction(value => value + 1);
};

export const decrementRouteVersion = async (providerName: string) => {
  await firebase
    .database()
    .ref(`/land-transport-versions/${providerName}/version`)
    .transaction(value => value - 1);
};

const createAutomaticRouteVersion = async (provider: ProviderEntity) => {
  await incrementRouteVersion(provider.name);
  const autoIncrementVersion = await getRouteVersion(provider.name);
  const version = `version-${autoIncrementVersion}`;

  let route = {
    active: false,
    addedAt: firebase.firestore.Timestamp.fromDate(new Date()),
    type: ProviderRoutesType.AUTOMATIC,
    version,
  } as Omit<AutomaticProviderRoute, 'versionDocuments'>;

  if (autoIncrementVersion === 1) route['active'] = true;

  await firebase
    .firestore()
    .collection(`land-transport-config/${provider.id}/routes`)
    .doc(version)
    .set(route);
  return version;
};

const saveRouteFilesToFirestore = async (
  provider: ProviderEntity,
  routeVersion: string,
  versionDocuments: ChecklistItemValueDocument[],
) => {
  return await firebase
    .firestore()
    .collection(`land-transport-config/${provider.id}/routes`)
    .doc(routeVersion)
    .set({ versionDocuments }, { merge: true });
};

const useStyles = makeStyles(theme => ({
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogContent: {
    paddingBottom: theme.spacing(3),
  },
  progress: {
    position: 'absolute',
  },
  addBtn: {
    margin: theme.spacing(1),
  },
}));

interface RouteFileUploadDialogProps {
  provider: ProviderEntity;
  isOpen: boolean;
  handleClose: () => void;
  saveFiles: (files: File[]) => Promise<any>;
}

const RoutesFileUploadDialog: React.FC<RouteFileUploadDialogProps> = ({ provider, isOpen, handleClose, saveFiles }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [filesState, setFilesState] = useState<File[]>([]);

  const [, userRecord] = useUser();

  const handleSave = async () => {
    try {
      setLoading(true);
      const routeVersion = await createAutomaticRouteVersion(provider);
      const documents = (await saveFiles(filesState)) as ChecklistItemValueDocument[];
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
      await saveRouteFilesToFirestore(provider, routeVersion, values);
    } catch (e) {
      console.error('Failed to Upload File', e);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle disableTypography id="dialog-title-check-list">
        <Typography variant="h4">Upload Files</Typography>
        <IconButton onClick={handleClose} disabled={loading} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box>
          <DropZoneArea
            handleOnDrop={files => setFilesState(files)}
            currentFiles={filesState}
            filesLimit={100}
            dropzoneProps={{ disabled: loading }}
            previewChipProps={{ disabled: loading }}
            dropzoneText={'Upload Files'}
          />
          <Typography variant="caption">Hint: You can drag & drop file over input.</Typography>
          <Box display="flex">
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              className={classes.addBtn}
              disabled={loading}
            >
              <CircularProgress
                size={16}
                color="inherit"
                className={classes.progress}
                style={{ visibility: loading ? 'visible' : 'hidden' }}
              />
              <span style={{ visibility: loading ? 'hidden' : 'visible' }}>{`Save Files`}</span>
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RoutesFileUploadDialog;
