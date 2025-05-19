import React, { useCallback, useContext, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  LinearProgress,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import { useDropzone } from 'react-dropzone';
import { InsertDriveFile } from '@material-ui/icons';
import firebase from '../firebase';
import { fileWithExt } from './bookings/checklist/ChecklistItemRow';
import { Booking, BookingLocType, StoredDocument } from '../model/Booking';
import {
  ActivityLogUserData,
  ChecklistItem,
  ChecklistItemValueDocument,
  DocumentValue,
} from './bookings/checklist/ChecklistItemModel';
import { useSnackbar } from 'notistack';
import UserRecordContext from '../contexts/UserRecordContext';
import CloseIcon from '@material-ui/icons/Close';

interface DropZoneProps {
  label?: string;
  storageBasePath: string;
  booking?: Booking;
  checklistItem?: ChecklistItem;
  documents?: DropZoneDocument[] | [];
  internal: boolean;
  onUpload?: (values: ChecklistItemValueDocument[], internal: boolean) => void;
  onDelete?: any;
}

export interface DropZoneDocument {
  url: string;
  name: string;
}

interface DocumentsListProps {
  documents: DropZoneDocument[];
  onDelete?: any;
}

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
  },
  dragZone: {
    height: '50px',
    border: '1px dashed #ccc',
    padding: '10px',
    textAlign: 'center',
    fontSize: '12px',
    lineHeight: 1,
    cursor: 'pointer',
    '&:hover': {
      borderColor: '#999',
    },
    '&:focus': {
      outline: 'none',
    },
  },
  documents: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexWrap: 'wrap',
  },
  documentItem: {
    margin: '5px',
  },
  documentButton: {
    padding: 0,
    minWidth: 'auto',
  },
  menuLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  tinyIconButton: {
    '& svg': {
      fontSize: 10,
    },
  },
}));

export const makeContentDispositionFilePrefix = (
  checklistItem: ChecklistItem | undefined,
  booking: Booking | undefined,
) => {
  if (checklistItem && booking && ['IMO', 'OOG'].includes(checklistItem.id)) {
    const deliveryRef = booking.CargoDetails?.[0]?.LocRefs.find(
      f => f.LocType === BookingLocType.delivery,
    );
    if (deliveryRef) {
      return `attachment; filename=${checklistItem.id}_${deliveryRef.LocRef}_`;
    }
  }
  return `attachment; filename=`;
};

export const makeContentDispositionFileName = (
  checklistItem: ChecklistItem | undefined,
  booking: Booking | undefined,
  file: File,
) => {
  return `${makeContentDispositionFilePrefix(checklistItem, booking)}${file.name}`;
};

export const DocumentsList: React.FC<DocumentsListProps> = ({ documents, onDelete }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleDocumentClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback((event: React.MouseEvent<unknown>) => {
    event.preventDefault();
    event.stopPropagation();

    setAnchorEl(null);
  }, []);

  const handleDownload = useCallback((event: React.MouseEvent<unknown>) => {
    event.stopPropagation();
  }, []);

  const handleDelete = useCallback(
    (event: React.MouseEvent<unknown>, name?: string) => {
      event.preventDefault();
      event.stopPropagation();
      onDelete(name);
    },
    [onDelete],
  );

  return (
    <ul className={classes.documents}>
      {documents.map((item: DropZoneDocument, index: number) => {
        return (
          <li key={`document-${index}`} className={classes.documentItem}>
            <Button
              aria-controls={`document-menu-${index}`}
              aria-haspopup="true"
              onClick={handleDocumentClick}
              className={classes.documentButton}
            >
              <InsertDriveFile />
            </Button>
            <Menu
              id={`document-menu-${index}`}
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                <Typography variant="body2">{item?.name}</Typography>
              </MenuItem>

              <MenuItem>
                <a
                  onClick={handleDownload}
                  href={item?.url}
                  download={item?.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes.menuLink}
                >
                  Download
                </a>
              </MenuItem>

              <Divider />
              <MenuItem onClick={event => handleDelete(event, item?.name)}>
                <Typography color="error">Delete</Typography>
              </MenuItem>
            </Menu>
          </li>
        );
      })}
    </ul>
  );
};

const DropZone: React.FC<DropZoneProps> = ({
  label,
  storageBasePath,
  booking,
  checklistItem,
  internal,
  documents,
  onUpload,
  onDelete,
  children,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const userRecord = useContext(UserRecordContext);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTask, setUploadTask] = useState<firebase.storage.UploadTask>(); // add some control to uploads so that users can cancel

  const getActivityLogUserData = useCallback(
    (): ActivityLogUserData =>
      ({
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName,
        alphacomClientId: userRecord?.alphacomClientId,
        alphacomId: userRecord?.alphacomId,
        emailAddress: userRecord?.emailAddress,
      }) as ActivityLogUserData,
    [userRecord],
  );

  const saveFiles = useCallback(
    async (files: File[]): Promise<any> => {
      const uploadFile = async (file: File): Promise<any> => {
        return new Promise((resolve, reject) => {
          const fileWithExtension = fileWithExt(file.name);
          const storedFileName = `${fileWithExtension.name}_${new Date().getTime()}.${fileWithExtension.ext}`;
          let path = [storageBasePath, storedFileName].join('/');

          let storageRef = firebase.storage().ref(encodeURI(path));
          let uploadTask = storageRef.put(file);
          setUploadTask(uploadTask);

          uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            snapshot => {
              console.log('progress: ', (snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              // in progress
              // if(snapshot.state === firebase.storage.TaskState.RUNNING) {
              //   // ex. calculate progress
              // }
            },
            error => {
              setUploadProgress(0);
              reject(error);
              enqueueSnackbar(
                <Typography color="inherit">Failed to upload file - {error.message}!</Typography>,
                {
                  variant: 'error',
                  autoHideDuration: 1000,
                },
              );
            },
            () => {
              setUploadProgress(0);
              // success
              storageRef.updateMetadata({
                contentDisposition: makeContentDispositionFileName(checklistItem, booking, file),
              });
              uploadTask.snapshot.ref.getDownloadURL().then((downloadURL: string) => {
                resolve({ url: downloadURL, name: file.name, storedName: storedFileName });
              });
            },
          );
        });
      };

      const requests = files.map((file: File) => {
        return uploadFile(file).then(storedItem => {
          return storedItem;
        });
      });

      return Promise.all(requests);
    },
    [storageBasePath, booking, checklistItem, enqueueSnackbar],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], internal: boolean) => {
      saveFiles(acceptedFiles)
        .then((documents: StoredDocument[]) => {
          const values = documents.map(item => {
            return {
              uploadedBy: getActivityLogUserData(),
              uploadedAt: new Date(),
              name: item.name,
              url: item.url,
              storedName: item.storedName,
            } as DocumentValue;
          });
          onUpload && onUpload(values, internal);
        })
        .catch(err => {
          console.error(`Error while storing files ${JSON.stringify(checklistItem, null, 2)}`, err);
        });
    },
    [checklistItem, saveFiles, onUpload, getActivityLogUserData],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => onDrop(acceptedFiles, internal),
  });

  return (
    <div {...getRootProps()} className={classes.dragZone}>
      <input {...getInputProps()} />
      {uploadProgress > 0 && (
        <Box display="flex">
          <div style={{ width: '100%', paddingTop: '14px' }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </div>
          <IconButton
            className={classes.tinyIconButton}
            aria-label="cancel upload"
            onClick={() => {
              uploadTask?.cancel();
              setUploadTask(undefined);
              setUploadProgress(0);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      {documents && documents.length > 0 ? (
        <DocumentsList documents={documents} onDelete={onDelete} />
      ) : isDragActive ? (
        <small>Drop the files here...</small>
      ) : label ? (
        <small>{label}</small>
      ) : (
        <small>
          Drag &amp; drop files here,
          <br />
          or click to upload
        </small>
      )}
      {children}
    </div>
  );
};

export default DropZone;
