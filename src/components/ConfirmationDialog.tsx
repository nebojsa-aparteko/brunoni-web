import React from 'react';
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(() =>
  createStyles({
    closeModal: {
      position: 'absolute',
      top: '5px',
      right: '12px',
      width: '47px',
      height: '47px',
    },
    dialogActions: {
      display: 'flex',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
  }),
);

interface ConfirmationDialogProps {
  isOpen: boolean;
  label: string;
  handleConfirm: () => void;
  handleClose: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, label, handleConfirm, handleClose }) => {
  const classes = useStyles();

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="xs" fullWidth>
      <Box>
        <DialogTitle disableTypography>
          <Typography variant="h4">{label}</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleClose} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ConfirmationDialog;
