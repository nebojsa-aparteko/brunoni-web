import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import CommentInput from '../../CommentInput';
import { Booking } from '../../../model/Booking';
import {
  ChecklistItemValueDocument,
  ChecklistItemValueDocumentStatusType,
  ChecklistNames,
} from '../checklist/ChecklistItemModel';
import { RejectionInput } from './RejectionModal';
import { formatDateSafe } from '../../../utilities/formattingHelpers';
import PDFViewer from '../../pdfViewer/PDFViewer';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ActivityLogItem, ActivityType } from '../checklist/ActivityModel';
import ActivityLogItemView from '../checklist/ActivityLogItemView';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';
import { flow } from 'lodash/fp';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import ActingAs from '../../../contexts/ActingAs';
import HTMLViewer from '../../HTMLViewer';

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
    expansionPanelHeading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
    expansionPanelContent: {
      flexDirection: 'column',
    },
    activityList: {
      maxHeight: '15vh',
      overflow: 'auto',
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
}) => {
  const classes = useStyles();
  const [amendmentRequested, setAmendmentRequested] = useState<boolean>(false);
  const actingAs = useContext(ActingAs)[0];

  const [leftDocument, setLeftDocument] = useState<ChecklistItemValueDocument | undefined>();
  const [rightDocument, setRightDocument] = useState<ChecklistItemValueDocument | undefined>(document);

  useEffect(() => {
    setLeftDocument(sortedDocuments?.filter(doc => doc.checklistId === ChecklistNames.SHIPPING_INSTRUCTIONS)?.[0]);
  }, [sortedDocuments]);

  const handleChangeLeftDocument = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLeftDocument(sortedDocuments?.find(doc => doc.url === (event.target.value as string)) || leftDocument);
  };

  const handleChangeRightDocument = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRightDocument(sortedDocuments?.find(doc => doc.url === (event.target.value as string)) || rightDocument);
  };

  const activityLogCollection = useFirestoreCollection(
    'bookings',
    useCallback(
      query => {
        const queryByItemFilter = query.where('type', '==', ActivityType.COMMENT);
        const queryByAdminRole = queryByItemFilter.where('isInternal', '==', false);
        return queryByAdminRole.orderBy('at', 'desc');
      },
      [actingAs],
    ),
    booking.id,
    'activity',
  );

  const normalizeActivity = flow(update('at', invoke('toDate')));

  const activityCollection = activityLogCollection?.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ActivityLogItem[];

  const filteredActivities = activityCollection?.filter(activity => activity.documents && activity.documents);

  const handleApproveDocument = () => {
    updateDocumentStatus(ChecklistItemValueDocumentStatusType.APPROVED);
  };

  const renderDocument = (document: ChecklistItemValueDocument, fileType: string | undefined) => {
    switch (fileType) {
      case 'pdf':
        return (
          <Box width="100%" position="relative" display="flex" flexDirection="column">
            <Paper style={{ padding: 8, maxWidth: '48vw' }}>
              <Typography style={{ fontWeight: 'bolder' }}>{document?.name}</Typography>
            </Paper>
            <Box style={{ flexFlow: 'column scroll', backgroundColor: 'grey', overflow: 'auto' }}>
              <PDFViewer file={document} />
            </Box>
          </Box>
        );
      case 'html':
        return (
          <Box width="100%" position="relative" display="flex" flexDirection="column">
            <Paper style={{ padding: 8, maxWidth: '48vw' }}>
              <Typography style={{ fontWeight: 'bolder' }}>{document?.name}</Typography>
            </Paper>
            <Box style={{ flexFlow: 'column scroll', backgroundColor: 'grey', overflow: 'auto' }}>
              <div>
                <HTMLViewer file={{ url: document.url }} />
              </div>
            </Box>
          </Box>
        );
      default:
        return (
          <Typography style={{ flex: 1, margin: 'auto' }}>
            The comparing option is currently only available for PDF files. The same functionality for other document
            types will be available soon.
          </Typography>
        );
    }
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
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}
      >
        {leftDocument && sortedDocuments ? (
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
        {rightDocument && sortedDocuments ? (
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
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
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
              {leftDocument ? (
                <Grid item xs={12} md={6} style={{ display: 'flex', minHeight: 0, height: '100%' }}>
                  {renderDocument(
                    leftDocument,
                    leftDocument?.name
                      .split('.')
                      .pop()
                      ?.toLowerCase(),
                  )}
                </Grid>
              ) : null}
              {rightDocument ? (
                <Grid item xs={12} md={6} style={{ display: 'flex', minHeight: 0, height: '100%' }}>
                  {renderDocument(
                    rightDocument,
                    rightDocument?.name
                      .split('.')
                      .pop()
                      ?.toLowerCase(),
                  )}
                </Grid>
              ) : null}
            </Grid>
          </Grid>
          <Grid item md style={{ flexGrow: 0 }}>
            {amendmentRequested ? (
              <React.Fragment>
                <Typography style={{ marginTop: 8 }}>
                  Please enter the description of what needs to be changed:
                </Typography>
                <CommentInput booking={booking} onInputChange={onRejectionInputChange} />
              </React.Fragment>
            ) : filteredActivities && filteredActivities.length > 0 ? (
              <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography className={classes.expansionPanelHeading}>
                    {'Amendment comments (' + filteredActivities.length + ')'}
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.expansionPanelContent}>
                  <List className={classes.activityList}>
                    {filteredActivities?.map((activity: ActivityLogItem) => (
                      <ListItem key={`act-${activity.id}`} id={activity.id}>
                        <ActivityLogItemView activityItem={normalizeActivity(activity)} />
                      </ListItem>
                    ))}
                  </List>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            ) : null}
          </Grid>
        </Grid>
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
              disabled={!rejectionInput || rejectionInput?.messagePlain.length < 1}
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
  updateDocumentStatus: (newStatus: ChecklistItemValueDocumentStatusType) => void;
  sortedDocuments: ChecklistItemValueDocument[];
  onReject: () => void;
  rejectionInput: RejectionInput | undefined;
  onRejectionInputChange: (input: RejectionInput) => void;
}
