import React, { PropsWithChildren, ReactElement } from 'react';
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
const useStyles = makeStyles(theme =>
  createStyles({
    closeModal: {
      position: 'absolute',
      top: '5px',
      right: '12px',
      width: '47px',
      height: '47px',
    },
  }),
);

const ActionModal: React.FC<Props> = ({ isOpen, handleClose, onSuccess, children }) => {
  const classes = useStyles();

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md" fullWidth>
      <Box>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{children}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="outlined" autoFocus>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSuccess();
              handleClose();
            }}
            variant="contained"
            color="primary"
          >
            Okay
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ActionModal;

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  onSuccess: () => void;
  children: ReactElement;
}
