import React, { useCallback } from 'react';
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

import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';

import { readAndParseFile } from '../../utilities/bookingRequestHtmlParser';

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

const BookingUploadDialog: React.FC<Props> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  // const [bookingInput, setBookingInput] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.every(file => ['html'].includes(file.name.split('.').pop() || ''))) {
        return enqueueSnackbar(<Typography color="inherit">File(s) must be .html format</Typography>, {
          variant: 'error',
        });
      }
      acceptedFiles.forEach(file => readAndParseFile(file));
    },
    [enqueueSnackbar],
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const handleBookingPaste = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    console.log('here');
  };

  const handleBookingSave = () => {
    console.log('saved');
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md">
      <Box className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">Upload Booking</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent} {...getRootProps()}>
          <input {...getInputProps()} />
          <Box>
            <TextField
              className={isDragActive ? classes.dropZone : classes.dropZoneDefault}
              id="booking-upload-dialog"
              InputLabelProps={{
                shrink: true,
              }}
              onClick={open}
              inputProps={{ style: { textAlign: 'center' } }}
              label={`Upload HTML Booking file inside this box`}
              variant="outlined"
              placeholder={`Please paste load HTML Booking files here`}
              multiline
              rows={10}
              onChange={handleBookingPaste}
              style={{ width: '100%' }}
              disabled={true}
            />
            <Typography variant="caption">Hint: You can drag & drop HTML bookings files over input.</Typography>
            <Box display="flex">
              <Button onClick={handleBookingSave} variant="contained" color="primary" className={classes.addBtn}>
                Save Booking
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

export default BookingUploadDialog;

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}
