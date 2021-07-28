import { Dialog, DialogContent, DialogTitle, Grid, IconButton, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { ChecklistItemValueDocument } from '../../bookings/checklist/ChecklistItemModel';
import CloseIcon from '@material-ui/icons/Close';
import BookingRequestViewMainContent from '../BookingRequestViewMainContent';
import { renderDocument } from '../../bookings/documentApproval/ComparisonDialogContent';

const useStyles = makeStyles(() => ({
  dialogPaper: {
    minHeight: '100vh',
    maxHeight: '100vh',
    minWidth: '100vw',
    maxWidth: '100vw',
  },
  dialogTitleBar: {
    height: '48px',
  },
  fileNumber: {
    alignSelf: 'baseline',
  },
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
  bookingViewContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: '100%',
    overflow: 'scroll',
  },
}));

interface ContentProps {
  document: ChecklistItemValueDocument;
}

const ComparisonDialogContent = ({ document }: ContentProps) => {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="column"
      spacing={1}
      className={classes.dialogContent}
      style={{ flex: 1, minHeight: 0, padding: 16, paddingLeft: 22 }}
    >
      <Grid item md style={{ display: 'flex', overflow: 'hidden' }}>
        <Grid
          container
          direction="row"
          spacing={1}
          style={{ flex: 1, overflow: 'hidden', width: '100%', minHeight: 0 }}
        >
          <Grid item xs={12} md={6} className={classes.bookingViewContainer}>
            <BookingRequestViewMainContent isPrintWithCost={false} />
          </Grid>

          <Grid item xs={12} md={6} style={{ display: 'flex', minHeight: 0, height: '100%' }}>
            {renderDocument(
              document,
              document?.name
                .split('.')
                .pop()
                ?.toLowerCase(),
              'rightDocumentContainer',
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const BookingRequestComparisonDialog: React.FC<Props> = ({ document, isOpen, bookingRequestId, handleClose }) => {
  const classes = useStyles();

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="dialog-title-check-list"
      maxWidth="xl"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle
        disableTypography
        id="dialog-title-check-list"
        className={classes.dialogTitleBar}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}
      >
        <Typography variant="h4" className={classes.fileNumber}>{`File No: ${bookingRequestId}`}</Typography>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <ComparisonDialogContent document={document} />
      </DialogContent>
    </Dialog>
  );
};

export default BookingRequestComparisonDialog;

interface Props {
  document: ChecklistItemValueDocument;
  isOpen: boolean;
  handleClose: () => void;
  bookingRequestId: string;
}
