import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import CommentInput from '../../CommentInput';
import { Booking } from '../../../model/Booking';
import { ChecklistItem } from '../checklist/ChecklistItemModel';
import { RejectionInput } from './RejectionModal';
import { TeamType } from '../../../model/Teams';

const useStyles = makeStyles(() => ({
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogContent: {
    display: 'flex',
    flexFlow: 'column',
  },
}));

const RejectionDialog: React.FC<Props> = ({
  isOpen,
  booking,
  handleClose,
  checklistItem,
  onReject,
  rejectionInput,
  onRejectionInputChange,
}) => {
  const classes = useStyles();

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md" fullWidth>
      <Box>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">{`Please enter needed correction on ${checklistItem.label} document`}</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <CommentInput
            booking={booking}
            onInputChange={onRejectionInputChange}
            mentionTeamsType={TeamType.OPERATIONS}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="outlined" autoFocus>
            Cancel
          </Button>
          <Button
            onClick={onReject}
            variant="contained"
            color="primary"
            disabled={!rejectionInput || rejectionInput.messagePlain.trim() === ''}
          >
            Request amendment
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default RejectionDialog;

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  booking: Booking;
  checklistItem: ChecklistItem;
  onReject: () => void;
  rejectionInput: RejectionInput | undefined;
  onRejectionInputChange: (input: RejectionInput) => void;
}
