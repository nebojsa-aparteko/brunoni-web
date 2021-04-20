import React, { Fragment, useCallback, useContext, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Divider, makeStyles, Paper, Typography } from '@material-ui/core';
import { useBookingRequestsContext } from '../../providers/BookingRequestsProvider';
import Meta from '../Meta';
import BookingsEmptyResults from '../bookings/BookingsEmptyResults';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import BookingRequestsTable from './BookingRequestsTable';
import UserInput from '../inputs/UserInput';
import ActingAs from '../../contexts/ActingAs';
import useAdminUsers from '../../hooks/useAdminUsers';
import { CUSTOMER_FACING_ROLES, UserRecordMin, UserRecordMinProperties } from '../../model/UserRecord';
import theme from '../../theme';
import firebase from '../../firebase';
import pick from 'lodash/fp/pick';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(5),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(3),
    },

    ['@media print']: {
      marginTop: theme.spacing(0),
      paddingTop: theme.spacing(0),
    },
  },
  content: {
    padding: 0,
    overflowX: 'auto',
  },
  inner: {
    minWidth: 700,
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  },
  actions: {
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  },
  importOrExport: {
    flexDirection: 'row',
    marginLeft: theme.spacing(4),
  },
}));

interface Props {
  isAdmin?: boolean;
}
const BookingRequestsView: React.FC<Props> = ({ isAdmin }) => {
  const classes = useStyles();
  const actingAs = useContext(ActingAs)[0];
  const assignableUsers = useAdminUsers(CUSTOMER_FACING_ROLES);

  const [assignTo, setAssignTo] = useState<UserRecordMin | undefined>(undefined);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [bookingRequests, isLoading] = useBookingRequestsContext();

  const assignAgent = useCallback(
    event => {
      event.stopPropagation();
      selectedRequests.forEach((id: string) => {
        firebase
          .firestore()
          .collection('bookings-requests')
          .doc(id)
          .update('assignedUser', pick(UserRecordMinProperties)(assignTo))
          .then(() => {
            setSelectedRequests([]);
          });
      });
    },
    [selectedRequests, assignTo],
  );

  const onSelectRequest = useCallback(
    (id: string) =>
      setSelectedRequests(prevState =>
        prevState.includes(id) ? [...prevState.filter(t => t !== id)] : [...prevState, id],
      ),
    [setSelectedRequests],
  );

  return (
    <>
      <Meta title={`Booking Requests`} />

      <div>
        {bookingRequests ? (
          <Fragment>
            <Card>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1" display="inline">
                      Bookings Requests
                    </Typography>
                    <Divider orientation="vertical" style={{ height: '100%' }} />
                    <Box flex={1} />
                    {!actingAs && (
                      <Box display="flex" flexDirection="row">
                        <Box display="flex" style={{ minWidth: theme.spacing(35) }} mr={1}>
                          <UserInput
                            label="Assign task to"
                            users={assignableUsers}
                            onChange={(event, user) => {
                              setAssignTo(user || undefined);
                              event.stopPropagation();
                            }}
                            value={assignTo}
                          />
                        </Box>
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={assignAgent}
                          disabled={selectedRequests && selectedRequests.length === 0}
                        >
                          Assign user
                        </Button>
                      </Box>
                    )}
                  </Box>
                }
              />
            </Card>

            {bookingRequests.length === 0 && (
              <BookingsEmptyResults message={'There are no bookings that might need your attention at the moment. '} />
            )}

            {bookingRequests.length > 0 && (
              <Fragment>
                <CardContent className={classes.content}>
                  <BookingRequestsTable
                    bookingRequests={bookingRequests}
                    selectedRequests={selectedRequests}
                    onSelectRequest={onSelectRequest}
                  />
                </CardContent>

                {/*<CardActions className={classes.actions}>*/}
                {/*  {bookings && bookings.length > 0 && bookings.length > rowsPerPage && (*/}
                {/*    <TablePagination*/}
                {/*      component="div"*/}
                {/*      count={filteredResults ? filteredResults.length : 0}*/}
                {/*      onChangePage={handleChangePage}*/}
                {/*      onChangeRowsPerPage={handleChangeRowsPerPage}*/}
                {/*      page={page}*/}
                {/*      rowsPerPage={rowsPerPage}*/}
                {/*      rowsPerPageOptions={[10, 25, 50]}*/}
                {/*    />*/}
                {/*  )}*/}
                {/*</CardActions>*/}
              </Fragment>
            )}
          </Fragment>
        ) : (
          <Paper className={classes.root}>
            <ChartsCircularProgress />
          </Paper>
        )}
      </div>
    </>
  );
};

export default BookingRequestsView;
