import firebase from 'firebase/compat/app';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';
import {
  AutomaticProviderRoute,
  ProviderRoutesType,
} from '../../../../model/land-transport/providers/ProviderRoutes';
import { ChecklistItemValueDocument } from '../../../bookings/checklist/ChecklistItemModel';
import React, { useState } from 'react';
import useUser from '../../../../hooks/useUser';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Paper,
  PaperProps,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import DropZoneArea from '../../../dropzone/DropZoneArea';
import Draggable from 'react-draggable';
import SaveButton from '../../../SaveButton';

const getRouteVersion = async (providerId: string) => {
  return (
    await firebase.database().ref(`/land-transport-versions/${providerId}/version`).get()
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
  const version = `Version-${autoIncrementVersion}`;

  const createdAt = new Date();
  let route: AutomaticProviderRoute = {
    active: false,
    createdAt,
    updatedAt: createdAt,
    description: '',
    validity: null,
    type: ProviderRoutesType.AUTOMATIC,
    version,
  };

  await firebase
    .firestore()
    .collection(`land-transport-config/${provider.id}/routes`)
    .doc(version)
    .set(route);
  return version;
};

export const saveRouteFilesToFirestore = async (
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
          }) as ChecklistItemValueDocument,
      );
      const routeVersion = route ? route.version : await createAutomaticRouteVersion(provider);
      values.map(async value => await saveRouteFilesToFirestore(provider, routeVersion, value));
    } catch (e) {
      console.error('Failed to Upload File', e);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperComponent={PaperComponent}
    >
      <DialogTitle disableTypography id="dialog-automatic-route" style={{ cursor: 'move' }}>
        <Typography variant="h4">Version creation</Typography>
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
            dropzoneText={'Upload version documents'}
          />
          <Typography variant="caption">Hint: You can drag & drop files over input.</Typography>
          <Box display="flex">
            <SaveButton handleSave={handleSave} loading={loading} title={'Create new version'} />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

function PaperComponent(props: PaperProps) {
  return (
    <Draggable handle="#dialog-automatic-route" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export default RoutesFileUploadDialog;
