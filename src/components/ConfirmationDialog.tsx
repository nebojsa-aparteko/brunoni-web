import React, { ReactNode } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import isString from '../utilities/isString';

const useStyles = makeStyles((theme: Theme) => ({
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
  content: {
    margin: theme.spacing(3),
  },
}));

export interface ConfirmationDialogProps {
  isOpen: boolean;
  label: string;
  handleConfirm: () => void;
  handleClose: () => void;
  description: string | ReactNode;
  confirmLabel?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  label,
  description,
  handleConfirm,
  handleClose,
  confirmLabel = 'Confirm',
}) => {
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
        <DialogContent>
          {isString(description) ? <Typography className={classes.content}>{description}</Typography> : description}
        </DialogContent>
        <Divider />

        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleClose} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained">
            {confirmLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ConfirmationDialog;
