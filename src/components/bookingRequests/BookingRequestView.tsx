import React, { Fragment, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core';
import PrintIcon from '@material-ui/icons/Print';
import QuoteNav from '../quotes/QuoteItemNav';
import ArchiveIcon from '@material-ui/icons/Archive';
import ActingAs from '../../contexts/ActingAs';
import Page from '../bookings/Page';
import brunoniLogo from '../../assets/logo.brunoni.svg';
import allmarineLogo from '../../assets/logo.allmarine.png';
import { BookingRequest } from '../../model/BookingRequest';
import BookingRequestViewMainContent from './BookingRequestViewMainContent';
import BookingRequestCheckList from './checklist/BookingRequestChecklist';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import CloseIcon from '@material-ui/icons/Close';
import UserInput from '../inputs/UserInput';
import useAdminUsers from '../../hooks/useAdminUsers';
import UserRecord, { CUSTOMER_FACING_ROLES, UserRecordMin, UserRecordMinProperties } from '../../model/UserRecord';
import firebase from '../../firebase';
import pick from 'lodash/fp/pick';
import { ActivityChangeType, ActivityLogUserData } from '../bookings/checklist/ChecklistItemModel';
import useUser from '../../hooks/useUser';
import { createActivityObject } from '../bookings/checklist/ChecklistItemRow';
import { ActivityLogItem } from '../bookings/checklist/ActivityModel';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    width: '100%',
    margin: 0,

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(3),
    },

    ['@media print']: {
      marginTop: theme.spacing(0),
      paddingTop: theme.spacing(0),
    },
  },
  root: {
    padding: theme.spacing(3),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(3),
    },

    ['@media print']: {
      marginTop: theme.spacing(0),
      paddingTop: theme.spacing(0),
    },
  },
  logo: {
    width: '5em',
    ['@media print']: {
      width: '20em',
    },
  },
  title: {
    fontSize: '1.2em',
  },
  actionBar: {
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
    ['@media print']: {
      marginBottom: theme.spacing(0),
    },
  },
  actions: {
    '& > *': {
      marginLeft: theme.spacing(1),
    },
  },
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogBody: {
    minWidth: theme.spacing(100),
    width: 'auto',
    minHeight: theme.spacing(60),
  },
  dialogContent: {
    paddingBottom: theme.spacing(3),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
}));

interface AgentAssignmentDialogProps {
  bookingRequest: BookingRequest;
  isOpen: boolean;
  handleClose: () => void;
}

const changeAssignedAgent = (id: string, user: UserRecordMin | null) =>
  firebase
    .firestore()
    .collection('booking-requests')
    .doc(id)
    .set(
      {
        assignedUser: user ? pick(UserRecordMinProperties)(user) : null,
      },
      { merge: true },
    );

//TODO delete and use the booking activity after we generalize it?
const addActivityItem = (bookingId: string, activityLog: ActivityLogItem) => {
  return firebase
    .firestore()
    .collection('booking-requests')
    .doc(bookingId)
    .collection('activity')
    .doc()
    .set(activityLog);
};

const AgentAssignmentDialog: React.FC<AgentAssignmentDialogProps> = ({ bookingRequest, isOpen, handleClose }) => {
  const classes = useStyles();
  const userRecord = useUser()[1];
  const assignableUsers = useAdminUsers(CUSTOMER_FACING_ROLES);

  const getActivityLogUserData = useCallback(
    (user: UserRecord | UserRecordMin | null | undefined): ActivityLogUserData =>
      ({
        firstName: user?.firstName,
        lastName: user?.lastName,
        alphacomClientId: user?.alphacomClientId,
        alphacomId: user?.alphacomId,
        emailAddress: user?.emailAddress,
      } as ActivityLogUserData),
    [userRecord],
  );

  const handleChangeAgent = (user: UserRecordMin | null) => {
    bookingRequest.id &&
      changeAssignedAgent(bookingRequest.id, user)
        .then(() =>
          addActivityItem(
            bookingRequest.id || '',
            createActivityObject({
              changeType: ActivityChangeType.ASSIGNED_AGENT,
              by: getActivityLogUserData(userRecord),
              addedUsers: [getActivityLogUserData(user)],
            }),
          ),
        )
        .then(handleClose);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle disableTypography>
        <Typography variant="h4">Watchers</Typography>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        <Box my={1}>
          <UserInput
            value={bookingRequest.assignedUser}
            label="Assigned Agent"
            users={assignableUsers || []}
            onChange={(_, user) => handleChangeAgent(user)}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export const getBookingRequestTitle = (bookingRequest?: BookingRequest) => {
  return bookingRequest?.carrier?.id?.toUpperCase() || '';
};

function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}

const BookingRequestView: React.FC<Props> = ({ bookingRequest }) => {
  const actingAs = useContext(ActingAs)[0];
  const classes = useStyles();

  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [printRequested, setPrintRequested] = useState(false);
  const [isPrintWithCost, setPrintWithCost] = useState(false);

  const handleCloseAssignmentDialog = () => setIsAssignmentDialogOpen(false);

  const onArchiveClick = useCallback(() => {
    // firebase
    //   .firestore()
    //   .collection('booking-requests')
    //   .doc(bookingRequest?.id)
    //   .update('archived', !bookingRequest?.archived);
    //
    // // if the booking was in dispute and action is to archive it
    // // this is expected to be very rare so leave it as a separate call
    // if (bookingRequest.inDispute && !bookingRequest.archived) {
    //   firebase
    //     .firestore()
    //     .collection('booking-requests')
    //     .doc(bookingRequest?.id)
    //     .update('inDispute', false);
    // }
  }, [bookingRequest]);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClickMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  useLayoutEffect(() => {
    if (printRequested) {
      window.print();
      setPrintRequested(false);
    }
  }, [printRequested]);
  return (
    <Grid container direction="row" spacing={2} justify="center" alignItems="flex-start" className={classes.body}>
      <Grid item md={7} xs={12}>
        <Page title={getBookingRequestTitle(bookingRequest)}>
          {isAssignmentDialogOpen ? (
            <AgentAssignmentDialog
              bookingRequest={bookingRequest}
              isOpen={true}
              handleClose={handleCloseAssignmentDialog}
            />
          ) : null}
          <ScrollToTopOnMount />
          <Paper className={classes.root}>
            <Box display="none" displayPrint="block" mb={2}>
              <Box mb={2}>
                <img
                  src={process.env.REACT_APP_BRAND === 'brunoni' ? brunoniLogo : allmarineLogo}
                  alt=""
                  className={classes.logo}
                />
              </Box>
              <Divider />
            </Box>

            <Box className={classes.actionBar} mb={2} display="flex" alignItems="end" justifyContent="space-between">
              <Box
                className={classes.actionBar}
                mb={2}
                display="flex"
                flexDirection="row"
                alignItems="end"
                justifyContent="space-between"
              >
                <QuoteNav
                  backTo="/bookings"
                  title={`Booking Request - ${getBookingRequestTitle(bookingRequest)}`}
                  subtitle={`File No. ${bookingRequest.id}`}
                />
              </Box>
              <Box flex="1" />
              <Box className={classes.actions} displayPrint="none">
                <IconButton
                  // color="primary"
                  size="small"
                  aria-label="Watch"
                  component="span"
                  onClick={() => setIsAssignmentDialogOpen(true)}
                >
                  <SupervisedUserCircleIcon />
                </IconButton>
                {!actingAs && (
                  <Fragment>
                    <Button
                      aria-label="archive"
                      variant="outlined"
                      size="small"
                      startIcon={<ArchiveIcon />}
                      onClick={onArchiveClick}
                    >
                      {'Archive'}
                    </Button>
                  </Fragment>
                )}

                <IconButton aria-label="print" size="small" onClick={handleClickMenu}>
                  <PrintIcon />
                </IconButton>
                <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                  <MenuItem
                    onClick={() => {
                      setPrintWithCost(false);
                      setPrintRequested(true);
                      handleClose();
                    }}
                  >
                    Print without costs
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setPrintWithCost(true);
                      setPrintRequested(true);
                      handleClose();
                    }}
                  >
                    Print with cost
                  </MenuItem>
                </Menu>
              </Box>
            </Box>

            <Grid item xs={12}>
              <BookingRequestViewMainContent bookingRequest={bookingRequest} isPrintWithCost={isPrintWithCost} />
            </Grid>
          </Paper>
        </Page>
      </Grid>
      <Grid item md={4} xs={12}>
        <Box id="checklistBkg" displayPrint="none">
          <BookingRequestCheckList bookingRequest={bookingRequest} />
        </Box>
      </Grid>
    </Grid>
  );
};

interface Props {
  bookingRequest: BookingRequest;
}

export default BookingRequestView;
