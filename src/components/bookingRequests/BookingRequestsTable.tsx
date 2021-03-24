import React, { Fragment, useCallback } from 'react';
import {
  Box,
  Card,
  Container as MUIContainer,
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core';
import formatDate from 'date-fns/format';
import theme from '../../theme';
import InfoBoxItem from '../InfoBoxItem';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { withStyles } from '@material-ui/styles';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { BookingRequest } from '../../model/BookingRequest';
import Avatar from 'react-avatar';
import { useHistory } from 'react-router';

const useStyles = makeStyles(() => ({
  button: {
    position: 'relative',
  },
  progressButton: {
    position: 'absolute',
  },
  tableRowHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  progress: {
    width: '100%',
    backgroundColor: 'white',
    border: '1px solid #ccc',
  },
  progressBar: {
    width: '0%',
    height: '20px',
    backgroundColor: 'green',
  },
  avatarCell: {
    textAlign: 'center',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    display: 'block',
  },
  textEmphasized: {
    textTransform: 'uppercase',
  },
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  checkListBackdrop: {
    zIndex: 1,
  },
  dialogBody: {
    width: theme.spacing(100),
  },
  dialogContent: {
    paddingBottom: theme.spacing(3),
  },
  actionBarGridItem: {
    marginRight: 0,
    textAlign: 'right',
  },
  divider: {
    marginTop: theme.spacing(2),
  },
  card: {
    marginTop: '2em',
    marginLeft: '1px',
    marginRight: '1px',
    marginBottom: '1px',
  },
}));

interface BookingRequestsTableProps {
  bookingRequests: BookingRequest[] | undefined;
  isAdmin?: boolean;
}

interface BookingRequestRowProps {
  bookingRequest: BookingRequest;
  isAdmin?: boolean;
  preventDefaultClick?: boolean;
}

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      cursor: 'pointer',
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      '&:hover': {
        backgroundColor: 'rgba(161,213,255,0.15) !important',
      },
      '&:focus': {
        outline: 'none',
      },
      '&:nth-of-type(even)': {
        backgroundColor: theme.palette.background.default,
      },
    },
  }),
)(Box);

export const BookingRequestRow: React.FC<BookingRequestRowProps> = ({
  isAdmin,
  bookingRequest,
  preventDefaultClick,
}) => {
  const classes = useStyles();
  const history = useHistory();

  const handleRowClick = useCallback(
    (id: string) => {
      if (!preventDefaultClick) {
        history.push(`/booking-requests/${id}`);
      }
    },
    [history, preventDefaultClick],
  );

  return (
    <StyledTableRow tabIndex={-1} onClick={() => handleRowClick(bookingRequest.id!)}>
      <Grid container spacing={2} style={{ paddingTop: '10px' }}>
        <Grid item lg={12} xs={12}>
          {bookingRequest ? (
            <Fragment>
              <span className={classes.tableRowHeader}>
                <Typography variant="h5">Request No. {bookingRequest.id}</Typography>
              </span>
            </Fragment>
          ) : null}
        </Grid>
        <Grid item lg={12} xs={12}>
          <Grid container spacing={1}>
            <Grid item md={2} xs={12}>
              <InfoBoxItem
                title="Carrier"
                label1={
                  bookingRequest && bookingRequest.carrier && bookingRequest.carrier.name
                    ? bookingRequest.carrier?.name.toUpperCase()
                    : ''
                }
                gutterBottom
              />
            </Grid>
            <Grid item md={2} xs={12}>
              {/*TODO Fix label 1*/}
              <InfoBoxItem
                title="Containers"
                label1={
                  bookingRequest && bookingRequest.containers && bookingRequest.containers.length > 0
                    ? bookingRequest.containers
                        .map(
                          container =>
                            container.quantity +
                            ' x ' +
                            container.containerType?.name +
                            ' - ' +
                            container.commodityType?.name,
                        )
                        .join('\n')
                        .toUpperCase()
                    : ''
                }
                gutterBottom
              />
            </Grid>
            {bookingRequest.createdBy && (
              <Grid item style={{ width: '25%' }}>
                <InfoBoxItem
                  title="Created By"
                  label1={
                    <Avatar
                      name={bookingRequest.createdBy?.firstName + ' ' + bookingRequest.createdBy?.lastName}
                      title={`${bookingRequest.createdBy?.firstName + ' ' + bookingRequest.createdBy?.lastName} <${
                        bookingRequest.createdBy?.emailAddress ? bookingRequest.createdBy?.emailAddress : null
                      }>`}
                      size="40"
                      round={true}
                      style={{ paddingLeft: '9px' }}
                    />
                  }
                  gutterBottom
                />
              </Grid>
            )}
            <Grid item md={2} xs={12}>
              {/*TODO Fix label 1*/}
              <InfoBoxItem title="Is IMO" label1={bookingRequest && bookingRequest.imo ? 'Yes' : 'No'} gutterBottom />
            </Grid>
            <Grid item md={2} xs={12}>
              {/*TODO Fix label 1*/}
              <InfoBoxItem title="Is S.O." label1={bookingRequest && bookingRequest.soc ? 'Yes' : 'No'} gutterBottom />
            </Grid>
            <Grid item xs={12}>
              <Divider style={{ paddingTop: '0px', paddingBottom: '0px' }} />
            </Grid>
            {bookingRequest.quoteNumber && (
              <Grid item md={2} xs={12}>
                <InfoBoxItem title="Quote Number" label1={bookingRequest.quoteNumber} gutterBottom />
              </Grid>
            )}
            {bookingRequest.customerReference && (
              <Grid item md={3} xs={12}>
                <InfoBoxItem
                  title={isAdmin ? 'Customer reference' : 'Reference'}
                  label1={bookingRequest.customerReference}
                  gutterBottom
                />
              </Grid>
            )}
            <Grid item md={3} xs={12}>
              <Fragment>
                <Box style={{ display: 'flex', flexDirection: 'row' }}>
                  <Box style={{ width: '50%', paddingRight: '20px' }}>
                    <InfoBoxItem
                      IconComponent={ChevronRightIcon}
                      title="Origin"
                      label1={
                        <Fragment>
                          {bookingRequest.origin?.city + ', ' + bookingRequest.origin?.country}
                          <br />
                        </Fragment>
                      }
                      gutterBottom
                    />
                  </Box>
                  <Box style={{ width: '50%' }}>
                    <InfoBoxItem
                      IconComponent={LastPageIcon}
                      title="Destination"
                      label1={
                        <Fragment>
                          {bookingRequest.destination?.city + ', ' + bookingRequest.destination?.country}
                          <br />
                        </Fragment>
                      }
                      gutterBottom
                    />
                  </Box>
                </Box>
              </Fragment>
            </Grid>
            <Grid item md={4} xs={12} style={{ display: 'flex', flexDirection: 'row' }}>
              <Grid item style={{ width: '45%' }}>
                <InfoBoxItem
                  title="Created On"
                  label1={bookingRequest.createdAt ? formatDate(bookingRequest.createdAt, 'dd.MM.yyyy') : ''}
                  gutterBottom
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </StyledTableRow>
  );
};

const BookingRequestsTable: React.FC<BookingRequestsTableProps> = ({ bookingRequests, isAdmin }) => {
  const classes = useStyles();
  console.log(bookingRequests);
  return (
    <Fragment>
      {!bookingRequests ? (
        <MUIContainer maxWidth="md">
          <Paper>
            <ChartsCircularProgress />
          </Paper>
        </MUIContainer>
      ) : (
        bookingRequests.map(bookingRequest => (
          <Card id="bookingSummaryBkgTable" className={classes.card} key={bookingRequest.id}>
            <BookingRequestRow isAdmin={isAdmin} bookingRequest={bookingRequest} />
          </Card>
        ))
      )}
    </Fragment>
  );
};

export default BookingRequestsTable;
