import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Box, Button, Divider, Grid, IconButton, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import PrintIcon from '@material-ui/icons/Print';
import Page from './Page';
import { Booking, BookingCategory, BookingVersion, Remark } from '../../model/Booking';
import QuoteNav from '../quotes/QuoteItemNav';
import BookingSummary from './BookingSummary';
import ContainerDetails from './ContainerDetails';
import BookingFreight from './BookingFreight';
import PortTerms from './PortTerms';
import SpecialRemarks from './SpecialRemarks';
import CheckList from './checklist/CheckList';
import ArchiveIcon from '@material-ui/icons/Archive';
import firebase from '../../firebase';
import ActingAs from '../../contexts/ActingAs';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import WatchersDialog from '../watchers/WatchersDialog';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import useUser from '../../hooks/useUser';
import UserRecord, { isSuperAdmin } from '../../model/UserRecord';
import { useSnackbar } from 'notistack';
import WatcherIconButton from '../watchers/WatcherIconButton';

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
  tableWrapper: {
    overflowX: 'auto',
    ['@media print']: {
      width: '30%',
    },
  },
  actions: {
    '& > *': {
      marginLeft: theme.spacing(1),
    },
  },
  hidePrint: {
    ['@media print']: {
      display: 'none',
    },
  },
}));

interface Props {
  booking: Booking;
}

const getBookingTitle = (booking?: Booking) => {
  return booking?.CarrierID?.toUpperCase() || '';
};

function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}

const handlePrint = () => {
  window.print();
};

const remark = {
  special: 'SPECIAL REMARKS',
  final: 'FINAL REMARKS',
};

export const isLongVersion = (version: BookingVersion) => {
  return version === 'Long';
};

export const isImport = (category: BookingCategory) => {
  return category === BookingCategory.Import;
};

const handleWatch = (id: string, watchers: UserRecord[]) =>
  firebase
    .firestore()
    .collection('bookings')
    .doc(id)
    .update('watchers', watchers);

const BookingView: React.FC<Props> = ({ booking }) => {
  console.log('Booking object: ', booking);

  const actingAs = useContext(ActingAs)[0];
  const classes = useStyles();
  const bookingAgent = useUserByAlphacomId(booking?.BkgAgentContact || undefined);
  const userRecord = useUser()[1];
  const { enqueueSnackbar } = useSnackbar();

  const [isOpenWatcherDialog, setIsOpenWatcherDialog] = useState(false);

  const handleCloseWatcherDialog = () => setIsOpenWatcherDialog(false);

  const specialRemarks: Remark[] = useMemo(
    () =>
      booking
        ? flow(
            get('Remarks'),
            filter((item: Remark) => item.RemarkType === remark.special),
          )(booking)
        : [],
    [booking],
  );
  const finalRemarks: Remark[] = useMemo(
    () =>
      booking
        ? flow(
            get('Remarks'),
            filter((item: Remark) => item.RemarkType === remark.final),
          )(booking)
        : [],
    [booking],
  );

  const onArchiveClick = useCallback(() => {
    firebase
      .firestore()
      .collection('bookings')
      .doc(booking?.id)
      .update('archived', !booking?.archived);
  }, [booking]);

  const onWatch = useCallback(
    (isWatching: boolean) => {
      handleWatch(
        booking.id,
        isWatching
          ? booking.watchers.filter(u => u.alphacomId !== userRecord.alphacomId)
          : [...(booking.watchers || []), userRecord],
      )
        .then(_ =>
          enqueueSnackbar(
            <Typography color="inherit">
              {isWatching ? 'Successfully removed from watchers!' : 'Successfully added to watchers!'}
            </Typography>,
            {
              variant: 'success',
              autoHideDuration: 1000,
            },
          ),
        )
        .catch(err => console.log(err));
    },
    [booking.id, booking.watchers, userRecord, userRecord.alphacomId],
  );
  return (
    <Grid container direction="row" spacing={2} justify="center" alignItems="flex-start" className={classes.body}>
      <Grid item md={7} xs={12}>
        <Page title={getBookingTitle(booking)}>
          <WatchersDialog
            booking={booking}
            isOpen={isOpenWatcherDialog}
            handleClose={handleCloseWatcherDialog}
            id={booking.id}
            watchers={booking.watchers || []}
          />
          <ScrollToTopOnMount />
          <Paper className={classes.root}>
            <Box display="none" displayPrint="block" mb={2}>
              <Box mb={2}>
                {/* <img
                  src={require(`../assets/logo.${process.env.REACT_APP_BRAND}.png`)}
                  alt={changeCase.capitalCase(process.env.REACT_APP_BRAND || '')}
                  style={{ width: '5em' }}
                /> */}
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
                  title={`Booking - ${getBookingTitle(booking)}`}
                  subtitle={`File No. ${booking.id}`}
                />
                <Typography variant={'h5'} style={{ paddingLeft: '20px' }}>
                  {booking?.Agreement
                    ? 'Agreement No. ' + booking?.Agreement
                    : booking?.StatClientRef
                    ? 'Agreement No. ' + booking.StatClientRef
                    : null}
                </Typography>
              </Box>
              <Box flex="1" />
              <Box>
                {actingAs == null && isSuperAdmin(userRecord) ? (
                  <IconButton size="small" onClick={() => setIsOpenWatcherDialog(true)}>
                    <SupervisedUserCircleIcon />
                  </IconButton>
                ) : (
                  <WatcherIconButton
                    isWatching={booking.watchers.findIndex(val => val.alphacomId === userRecord.alphacomId) !== -1}
                    handleWatch={onWatch}
                  />
                )}
              </Box>
              <Box className={classes.actions} displayPrint="none">
                <Button
                  aria-label="print"
                  variant="outlined"
                  size="small"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                >
                  Print
                </Button>

                {!actingAs && (booking.pendingPayment || booking.archived) && (
                  <Button
                    aria-label="archive"
                    variant="outlined"
                    size="small"
                    startIcon={<ArchiveIcon />}
                    onClick={onArchiveClick}
                  >
                    {booking.archived ? 'Restore' : 'Archive'}
                  </Button>
                )}
              </Box>
            </Box>

            <Grid item xs={12}>
              <Page title={getBookingTitle(booking)}>
                <Box marginTop="1em" marginBottom="0em">
                  <BookingSummary booking={booking} bookingAgent={bookingAgent} />
                </Box>
                <Box marginTop="0em" marginBottom="0em">
                  <ContainerDetails
                    cargoDetail={booking.CargoDetails}
                    version={booking.Version}
                    category={booking?.Category}
                    tariffDetails={booking?.CtrTariffsDetails}
                  />
                </Box>
                {isLongVersion(booking.Version) && !isImport(booking?.Category) ? (
                  <Fragment>
                    <Box marginTop="0em" marginBottom="0em">
                      <PortTerms portTerms={booking.PortTerms} />
                    </Box>
                    <Box marginTop="0em" marginBottom="0em">
                      <SpecialRemarks remarks={specialRemarks} />
                    </Box>
                  </Fragment>
                ) : null}

                {booking.FreightDetails && (
                  <Box marginTop="0em" marginBottom="0em">
                    <BookingFreight freightDetails={booking.FreightDetails} />
                  </Box>
                )}
                <Box style={{ paddingTop: '10px', textAlign: 'justify' }}>
                  {finalRemarks.map((item, index) => {
                    const text = item.RemarkTxt.split('<br/><br/>'); // split the string into an array for each new paragraph

                    return item.RemarkTxt ? (
                      <Typography variant="body2" key={`final-remark-${index}`}>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: text.map(remark => remark.split('<br/>').join('')).join('<br/><br/>'),
                          }}
                        />
                        {/* remove all <br/> from the elements of the string array to get rid of manual new rows and join the elements, aka paragraphs with <br/><br/> as they were initially */}
                      </Typography>
                    ) : null;
                  })}
                </Box>
              </Page>
            </Grid>
          </Paper>
        </Page>
      </Grid>
      <Grid item md={4} xs={12}>
        <CheckList booking={booking} />
      </Grid>
    </Grid>
  );
};

export default BookingView;
