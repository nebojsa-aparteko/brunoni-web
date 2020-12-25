import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Booking } from '../../../model/Booking';
import {
  ChecklistItemValueDocument,
  ChecklistItemValueDocumentStatusType,
  ChecklistNames,
} from '../checklist/ChecklistItemModel';
import { RejectionInput } from './RejectionModal';
import { formatDateSafe } from '../../../utilities/formattingHelpers';
import ComparisonDialogContent from './ComparisonDialogContent';

const useStyles = makeStyles(theme =>
  createStyles({
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
    dialogActions: {
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    formControl: {
      marginTop: -4,
      marginRight: theme.spacing(4),
      minWidth: 400,
      height: 40,
    },
  }),
);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ComparisonDialog: React.FC<Props> = ({
  document,
  isOpen,
  booking,
  handleClose,
  updateDocumentStatus,
  sortedDocuments,
  onReject,
  rejectionInput,
  onRejectionInputChange,
  isAccountingDialog,
}) => {
  const classes = useStyles();
  const [amendmentRequested, setAmendmentRequested] = useState<boolean>(false);

  const [leftDocument, setLeftDocument] = useState<ChecklistItemValueDocument | undefined>();
  const [rightDocument, setRightDocument] = useState<ChecklistItemValueDocument | undefined>(document);

  useEffect(() => {
    setLeftDocument(sortedDocuments?.filter(doc => doc.checklistId === ChecklistNames.SHIPPING_INSTRUCTIONS)?.[0]);
  }, [sortedDocuments]);

  const handleChangeLeftDocument = (event: React.ChangeEvent<{ value: unknown }>) => {
    event.stopPropagation();
    setLeftDocument(sortedDocuments?.find(doc => doc.url === (event.target.value as string)) || leftDocument);
  };

  const handleChangeRightDocument = (event: React.ChangeEvent<{ value: unknown }>) => {
    event.stopPropagation();
    setRightDocument(sortedDocuments?.find(doc => doc.url === (event.target.value as string)) || rightDocument);
  };

  const handleApproveDocument = () => {
    updateDocumentStatus(ChecklistItemValueDocumentStatusType.APPROVED);
  };

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
        <Typography variant="h4" className={classes.fileNumber}>{`File No: ${booking.id}`}</Typography>
        <Box style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {!isAccountingDialog && leftDocument && sortedDocuments ? (
            <FormControl className={classes.formControl}>
              <InputLabel>Left Document</InputLabel>
              <Select value={leftDocument?.url} onChange={handleChangeLeftDocument} MenuProps={MenuProps}>
                {sortedDocuments
                  .filter(document => document.url !== rightDocument?.url)
                  .map(document => (
                    <MenuItem key={document.url} value={document.url}>
                      {(document.name || document.storedName) +
                        ' (' +
                        formatDateSafe(document.uploadedAt, 'HH:MM - dd.MM.yyyy') +
                        ')'}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ) : null}
          {!isAccountingDialog && rightDocument && sortedDocuments ? (
            <FormControl className={classes.formControl}>
              <InputLabel>Right Document</InputLabel>
              <Select value={rightDocument?.url} onChange={handleChangeRightDocument} MenuProps={MenuProps}>
                {sortedDocuments
                  .filter(document => document.url !== leftDocument?.url)
                  .map(document => (
                    <MenuItem key={document.url} value={document.url}>
                      {(document.name || document.storedName) +
                        ' (' +
                        formatDateSafe(document.uploadedAt, 'HH:MM - dd.MM.yyyy') +
                        ')'}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ) : null}
        </Box>

        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <ComparisonDialogContent
          booking={booking}
          document={document}
          leftDocument={leftDocument}
          rightDocument={rightDocument}
          onRejectionInputChange={onRejectionInputChange}
          amendmentRequested={amendmentRequested}
          isAccountingDialog={isAccountingDialog}
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        {amendmentRequested ? (
          <React.Fragment>
            <Button onClick={() => setAmendmentRequested(false)} color="primary" variant="outlined" autoFocus>
              Cancel amendment
            </Button>
            <Button
              onClick={onReject}
              variant="contained"
              color="primary"
              disabled={!rejectionInput || rejectionInput.messagePlain.trim() === ''}
            >
              Send request
            </Button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Button onClick={handleClose} color="primary" variant="outlined" autoFocus>
              Cancel
            </Button>
            <Button onClick={() => setAmendmentRequested(true)} variant="contained" color="primary">
              Request amendment
            </Button>
            <Button
              onClick={handleApproveDocument}
              style={{ backgroundColor: 'rgba(0,200,81, 1)' }}
              variant="contained"
              autoFocus
            >
              Approve
            </Button>
          </React.Fragment>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ComparisonDialog;

interface Props {
  document: ChecklistItemValueDocument;
  isOpen: boolean;
  handleClose: () => void;
  booking: Booking;
  updateDocumentStatus: (newStatus: ChecklistItemValueDocumentStatusType, dontCreateActivity?: boolean) => void;
  sortedDocuments: ChecklistItemValueDocument[];
  onReject: () => void;
  rejectionInput: RejectionInput | undefined;
  onRejectionInputChange: (input: RejectionInput) => void;
  isAccountingDialog?: boolean;
}
