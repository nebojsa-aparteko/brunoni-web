import React, { Fragment, useCallback, useContext, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  makeStyles,
  Paper,
  TablePagination,
  Tooltip,
  Typography,
} from '@material-ui/core';
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
import BookingsFiltersBar from '../searchbar/BookingsFiltersBar';
import { useBookingListPaginationContext } from '../../providers/BookingListPaginationProvider';
import set from 'lodash/fp/set';
import flow from 'lodash/fp/flow';
import chunk from 'lodash/fp/chunk';
import get from 'lodash/fp/get';
import { BookingRequest } from '../../model/BookingRequest';
import AddIcon from '@material-ui/icons/Add';
import BookingUploadDialog from '../onlineBooking/BookingUploadDialog';
import useModal from '../../hooks/useModal';
import { useBookingRequestsFilterContext } from '../../providers/BookingRequestsFilterProvider';
import { GlobalContext } from '../../store/GlobalStore';
import { addActivityItem } from '../../utilities/activityHelper';
import { createActivityObject } from '../bookings/checklist/ChecklistItemRow';
import { ActivityChangeType } from '../bookings/checklist/ChecklistItemModel';
import useActivityLogUserData from '../../hooks/useActivityLogUserData';
import { getActivityLogUserData } from '../../utilities/getActivityLogUserData';
import ChargeCodes from '../../contexts/ChargeCodes';
import FirestoreCollectionProvider from '../../providers/FirestoreCollection';

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
  const { isOpen, openModal, closeModal } = useModal();
  const [, dispatch] = useContext(GlobalContext);

  const [assignTo, setAssignTo] = useState<UserRecordMin | undefined>(undefined);

  const byActivityLogUserData = useActivityLogUserData();

  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  const [bookingRequests, isLoading] = useBookingRequestsContext();
  const [filters, setFilters] = useBookingRequestsFilterContext();

  const [bookingPaginationContextData, setBookingPaginationContextData] = useBookingListPaginationContext();
  const { page, rowsPerPage } = bookingPaginationContextData;

  const [filteredResults, setFilteredResults] = useState<BookingRequest[] | undefined | null>([]);

  const resultChunks = useMemo(() => {
    setFilteredResults(bookingRequests);

    return chunk(rowsPerPage)(bookingRequests);
  }, [bookingRequests, rowsPerPage]);

  const handleChangePage = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
      if (setBookingPaginationContextData)
        setBookingPaginationContextData(set('page', page)(bookingPaginationContextData));
    },
    [bookingPaginationContextData, setBookingPaginationContextData],
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (setBookingPaginationContextData)
        setBookingPaginationContextData(
          flow(set('rowsPerPage', parseInt(event.target.value)), set('page', 0))(bookingPaginationContextData),
        );
    },
    [bookingPaginationContextData, setBookingPaginationContextData],
  );

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
          })
          .catch(e => {
            dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Error assigning task. Please try again.' });
            console.error(e);
          })
          .finally(async () => {
            await addActivityItem(
              'bookings-requests',
              id,
              createActivityObject({
                changeType: ActivityChangeType.ASSIGNED_AGENT,
                by: byActivityLogUserData,
                addedUsers: [getActivityLogUserData(assignTo)],
              }),
            );
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
    <FirestoreCollectionProvider name="charge-codes" context={ChargeCodes}>
      <Meta title={`Booking Requests`} />

      <BookingsFiltersBar filters={filters} setFilters={setFilters} showAssigneeFilter={isAdmin} />

      <div>
        {bookingRequests && !isLoading ? (
          <Fragment>
            <Card>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1" display="inline">
                      Bookings Requests
                    </Typography>
                    <Box ml={2}>
                      <Tooltip title="Add from a html file">
                        <IconButton onClick={openModal} style={{ display: 'flex', flexDirection: 'column' }}>
                          <AddIcon fontSize="large" />
                        </IconButton>
                      </Tooltip>
                      {isOpen && <BookingUploadDialog isOpen={isOpen} handleClose={closeModal} />}
                    </Box>
                    <Divider orientation="vertical" style={{ height: '100%' }} />
                    <Box flex={1} />
                    {!actingAs && (
                      <Box display="flex" flexDirection="row">
                        <Box display="flex" style={{ minWidth: theme.spacing(35) }} ml={1} mr={1}>
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
                    bookingRequests={resultChunks && (get(page)(resultChunks) || [])}
                    isAdmin={isAdmin}
                    selectedRequests={selectedRequests}
                    onSelectRequest={onSelectRequest}
                  />
                </CardContent>

                <CardActions className={classes.actions}>
                  {bookingRequests && bookingRequests.length > 0 && bookingRequests.length > rowsPerPage && (
                    <TablePagination
                      component="div"
                      count={filteredResults ? filteredResults.length : 0}
                      onChangePage={handleChangePage}
                      onChangeRowsPerPage={handleChangeRowsPerPage}
                      page={page}
                      rowsPerPage={rowsPerPage}
                      rowsPerPageOptions={[10, 25, 50]}
                    />
                  )}
                </CardActions>
              </Fragment>
            )}
          </Fragment>
        ) : (
          <Paper className={classes.root}>
            <ChartsCircularProgress />
          </Paper>
        )}
      </div>
    </FirestoreCollectionProvider>
  );
};

export default BookingRequestsView;
