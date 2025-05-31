import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Papa, { ParseConfig, ParseResult } from 'papaparse';
import LoadListContainerModel from '../../../model/LoadListContainerModel';
import firebase from '../../../firebase';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles(theme =>
  createStyles({
    closeModal: {
      position: 'absolute',
      top: '5px',
      right: '12px',
      width: '47px',
      height: '47px',
    },
    dialogBody: {
      width: theme.spacing(100),
    },
    dialogContent: {
      paddingBottom: theme.spacing(3),
    },
    dropZone: {
      border: '1px dashed black',
    },
    dropZoneDefault: {
      border: '1px solid transparent',
    },
    addBtn: {
      margin: theme.spacing(1),
    },
  }),
);

const LoadListUploadDialog: React.FC<Props> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const [loadListInput, setLoadListInput] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [isHeaderValid, setIsHeaderValid] = useState(true);

  const parseCSV = useCallback(
    (input: string | File) => {
      return Papa.parse(input, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => {
          switch (header.trim()) {
            case 'Container number':
            case 'container':
              return 'container';
            case 'Seal number':
            case 'sealNum':
              return 'sealNum';
            case 'Status':
            case 'status':
              return 'status';
            default:
              setIsHeaderValid(false);
              return header;
          }
        },
        complete(results: ParseResult): void {
          console.log(results.data);
          const batch = firebase.firestore().batch();

          results.data.map(async (c: LoadListContainerModel) => {
            batch.set(firebase.firestore().collection('containers').doc(c.container), c, {
              merge: true,
            });
            console.log(c);
          });

          batch
            .commit()
            .then(_ =>
              enqueueSnackbar(
                <Typography color="inherit">Saved load list successfully!</Typography>,
                {
                  variant: 'success',
                },
              ),
            )
            .catch(err => console.trace(err));
        },
      }) as ParseConfig;
    },
    [enqueueSnackbar],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.every(file => ['csv', 'xls'].includes(file.name.split('.').pop() || ''))) {
        return enqueueSnackbar(<Typography color="inherit">File(s) must be csv type.</Typography>, {
          variant: 'error',
        });
      }
      acceptedFiles.forEach(file => parseCSV(file));
    },
    [enqueueSnackbar, parseCSV],
  );

  useEffect(() => {
    if (!isHeaderValid) {
      enqueueSnackbar(
        <Typography color="inherit">
          Headers of CSV are not properly spelled. Please check sample data.
        </Typography>,
        {
          variant: 'error',
        },
      );
    }
  }, [isHeaderValid, enqueueSnackbar]);
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });
  const handleLoadListPaste = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoadListInput(event.target.value);
    console.log(event.target.value);
  };

  const handleLoadListSave = useCallback(() => {
    parseCSV(loadListInput);
  }, [loadListInput, parseCSV]);
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="dialog-title-check-list"
      maxWidth="md"
    >
      <Box className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">Update Load List</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent} {...getRootProps()}>
          <input {...getInputProps()} />
          <Box className={isDragActive ? classes.dropZone : classes.dropZoneDefault}>
            <TextField
              id="load-list-text-field"
              InputLabelProps={{
                shrink: true,
              }}
              label={`Load list value`}
              variant="outlined"
              placeholder={`Please paste load list in this format:\nContainer number\tSeal number\tStatus`}
              multiline
              rows={10}
              onChange={handleLoadListPaste}
              style={{ width: '100%' }}
            />
            <Typography variant="caption">Hint: You can drag CSV files over input.</Typography>
            <Box display="flex">
              <Button
                onClick={handleLoadListSave}
                variant="contained"
                color="primary"
                className={classes.addBtn}
              >
                Save load list
              </Button>
              <Button onClick={open} variant="contained" color="default" className={classes.addBtn}>
                Attach File
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default LoadListUploadDialog;

interface Props {
  containers: LoadListContainerModel[];
  isOpen: boolean;
  handleClose: () => void;
}
