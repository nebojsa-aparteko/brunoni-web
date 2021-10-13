import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { useDialog } from '../TeamsPaymentConfirmationCustomerSettingsAddDialog';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TeamsRowInputDialog: React.FC<Props> = ({ open, setOpen }) => {
  const classes = useDialog();

  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="ReassignmentRulesDialogTitle" maxWidth="xl">
      <DialogTitle disableTypography id="ReassignmentRulesDialogTitle">
        <Typography variant="h4">Add new team</Typography>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box minWidth={250} maxWidth={300} margin={2}>
          Input 1
        </Box>
        <Box minWidth={250} maxWidth={300} margin={2}>
          Input 2
        </Box>
        <Box minWidth={250} maxWidth={300} margin={2}>
          Input 3
        </Box>
        <Box minWidth={250} maxWidth={300} margin={2}>
          Input 4
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" onClick={() => console.log('adding')} style={{ minWidth: 80 }}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamsRowInputDialog;
