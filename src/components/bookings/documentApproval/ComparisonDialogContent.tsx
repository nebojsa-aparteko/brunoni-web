import { Booking } from '../../../model/Booking';
import {
  Box,
  createStyles,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  List,
  ListItem,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import React, { ReactChild, useCallback, useContext } from 'react';
import CommentInput from '../../CommentInput';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ActivityLogItem, ActivityType } from '../checklist/ActivityModel';
import ActivityLogItemView from '../checklist/ActivityLogItemView';
import { ChecklistItemValueDocument } from '../checklist/ChecklistItemModel';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';
import { flow } from 'lodash/fp';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import PDFViewer from '../../pdfViewer/PDFViewer';
import HTMLViewer from '../../HTMLViewer';
import ActingAs from '../../../contexts/ActingAs';
import { RejectionInput } from './RejectionModal';
import ExpandingBookingContent from './ExpandingBookingContent';

const useStyles = makeStyles(theme =>
  createStyles({
    dialogContent: {
      display: 'flex',
      flexFlow: 'column',
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
    bookingViewContainer: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      height: '100%',
      overflow: 'scroll',
    },
    elevatedComponent: {
      boxShadow: '0 0 0 1px rgba(63,63,68,0.05), 0 1px 3px 0 rgba(63,63,68,0.15)',
    },
  }),
);

const DocumentLayout: React.FC<{ name: string; children: ReactChild }> = ({ name, children }) => {
  return (
    <Box width="100%" position="relative" display="flex" flexDirection="column">
      <Paper style={{ padding: 8, maxWidth: '48vw' }}>
        <Typography style={{ fontWeight: 'bolder' }}>{name}</Typography>
      </Paper>
      <Box style={{ flexFlow: 'column scroll', backgroundColor: 'grey', overflow: 'auto' }}>{children}</Box>
    </Box>
  );
};

const renderDocument = (document: ChecklistItemValueDocument, fileType: string | undefined) => (
  <DocumentLayout name={document.name}>
    {fileType === 'pdf' ? (
      <PDFViewer file={document} />
    ) : fileType === 'html' ? (
      <div>
        <HTMLViewer file={{ url: document.url }} />
      </div>
    ) : (
      <Typography style={{ flex: 1, margin: 'auto' }}>
        The comparing option is currently only available for PDF files. The same functionality for other document types
        will be available soon.
      </Typography>
    )}
  </DocumentLayout>
);

const ComparisonDialogContent = ({
  booking,
  document,
  leftDocument,
  rightDocument,
  onRejectionInputChange,
  amendmentRequested,
  isAccountingDialog,
}: Props) => {
  const actingAs = useContext(ActingAs)[0];
  const classes = useStyles();

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
          {!isAccountingDialog ? (
            leftDocument ? (
              <Grid item xs={12} md={6} style={{ display: 'flex', minHeight: 0, height: '100%' }}>
                {renderDocument(
                  leftDocument,
                  leftDocument?.name
                    .split('.')
                    .pop()
                    ?.toLowerCase(),
                )}
              </Grid>
            ) : null
          ) : (
            <Grid item xs={12} md={6} className={classes.bookingViewContainer}>
              <ExpandingBookingContent booking={booking} />
            </Grid>
          )}
          {!isAccountingDialog ? (
            rightDocument ? (
              <Grid item xs={12} md={6} style={{ display: 'flex', minHeight: 0, height: '100%' }}>
                {renderDocument(
                  rightDocument,
                  rightDocument?.name
                    .split('.')
                    .pop()
                    ?.toLowerCase(),
                )}
              </Grid>
            ) : null
          ) : (
            <Grid item xs={12} md={6} style={{ display: 'flex', minHeight: 0, height: '100%' }}>
              {renderDocument(
                document,
                document?.name
                  .split('.')
                  .pop()
                  ?.toLowerCase(),
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid item md style={{ flexGrow: 0 }}>
        {amendmentRequested ? (
          <React.Fragment>
            <Typography style={{ marginTop: 8 }}>Please enter the description of what needs to be changed:</Typography>
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
  );
};

interface Props {
  booking: Booking;
  document: ChecklistItemValueDocument;
  leftDocument: ChecklistItemValueDocument | undefined;
  rightDocument: ChecklistItemValueDocument | undefined;
  onRejectionInputChange: (input: RejectionInput) => void;
  amendmentRequested: boolean;
  isAccountingDialog: boolean | undefined;
}

export default ComparisonDialogContent;
