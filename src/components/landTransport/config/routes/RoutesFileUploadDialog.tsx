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

const getRouteVersion = async (providerId: string) => {
  return (
    await firebase
      .database()
      .ref(`/land-transport-versions/${providerId}/version`)
      .get()
  ).val() as number;
};

export const incrementRouteVersion = async (providerId: string) => {
  await firebase
    .database()
    .ref(`/land-transport-versions/${providerId}/version`)
    .transaction(value => value + 1);
};

const createAutomaticRouteVersion = async (provider: ProviderEntity) => {
  await incrementRouteVersion(provider.id);
  const autoIncrementVersion = await getRouteVersion(provider.id);
  const version = `version-${autoIncrementVersion}`;

  const addedAt = firebase.firestore.Timestamp.fromDate(new Date());

  let route = {
    active: false,
    addedAt,
    updatedAt: addedAt,
    type: ProviderRoutesType.AUTOMATIC,
    version,
  } as AutomaticProviderRoute;

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
  versionDocument: ChecklistItemValueDocument,
) => {
  const ref = firebase
    .firestore()
    .collection(`land-transport-config/${provider.id}/routes`)
    .doc(routeVersion)
    .collection('versionDocuments')
    .doc();
  const id = ref.id;
  return await ref.set({ ...versionDocument, id });
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
  route?: AutomaticProviderRoute;
  handleClose: () => void;
  saveFiles: (files: File[]) => Promise<any>;
}

const RoutesFileUploadDialog: React.FC<RouteFileUploadDialogProps> = ({
  provider,
  isOpen,
  route,
  handleClose,
  saveFiles,
}) => {
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [filesState, setFilesState] = useState<File[]>([]);

  const [, userRecord] = useUser();

  const handleSave = async () => {
    try {
      setLoading(true);
      const routeVersion = route ? route.version : await createAutomaticRouteVersion(provider);
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
      values.map(async value => await saveRouteFilesToFirestore(provider, routeVersion, value));
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
