import Avatar from 'react-avatar';
import React, { Fragment, useCallback, useState } from 'react';
import { useHistory } from 'react-router';
import {
  Box,
  Card,
  Container as MUIContainer,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import formatDate from 'date-fns/format';
import { Booking, CargoDetail } from '../../model/Booking';
import CheckList from './checklist/CheckList';
import theme from '../../theme';
import InfoBoxItem from '../InfoBoxItem';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { withStyles } from '@material-ui/styles';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { isImport } from './BookingView';
import { DateFormats, formatDateSafe, formatDistanceToNowConfigured } from '../../utilities/formattingHelpers';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import { useClientById, useClientByIdFromCache } from '../../hooks/useClient';
import WarningIcon from '@material-ui/icons/Warning';

const useStyles = makeStyles(() =>
  createStyles({
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
  }),
);

interface BookingsTableProps {
  bookings: Booking[] | undefined;
  isAdmin?: boolean;
}

interface BookingRowProps {
  booking: Booking;
  onProgressClick?: any;
  isAdmin?: boolean;
}

interface LocRefProps {
  cargoDetails: CargoDetail[];
}

interface ProgressDialogProps {
  isOpen: boolean;
  booking: Booking;
  handleClose: any;
}

interface ShipmentProgressProps {
  booking: Booking;
}

export const ShipmentProgress: React.FC<ShipmentProgressProps> = ({ booking }) => {
  const classes = useStyles();

  const { checklistItemCount, checklistCheckedCount } = booking;

  return (
    <div>
      <div className={classes.progress}>
        <div
          className={classes.progressBar}
          role="progressbar"
          style={{ width: `${(checklistCheckedCount / checklistItemCount) * 100}%` }}
        />
      </div>
      <Typography variant="subtitle2">
        {checklistCheckedCount}/{checklistItemCount}
      </Typography>
    </div>
  );
};

export const BoookingProgressDialog: React.FC<ProgressDialogProps> = ({ isOpen, handleClose, booking }) => {
  const classes = useStyles();

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md">
      <span className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">{booking?.CarrierID.toUpperCase()}</Typography>
          {booking && booking['BL-No'] ? <Typography variant="h6">BL Number: {booking['BL-No']}</Typography> : null}
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <CheckList booking={booking} />
        </DialogContent>
      </span>
    </Dialog>
  );
};

const LocRefs: React.FC<LocRefProps> = ({ cargoDetails }) => {
  return cargoDetails && cargoDetails[0] ? (
    <Fragment>
      {cargoDetails
        .map(cargoDetail =>
          cargoDetail
            ? cargoDetail.LocRefs && cargoDetail.LocRefs[0]
              ? cargoDetail.LocRefs.map(locRef =>
                  locRef && locRef.LocType === 'DELIVERY' && locRef.LocRef ? ' / ' + locRef.LocRef : '',
                ).join('')
              : ''
            : '',
        )
        .join('')
        .substring(3)}
    </Fragment>
  ) : null;
};

export const BookingRow: React.FC<BookingRowProps> = ({ isAdmin, booking, onProgressClick }) => {
  const classes = useStyles();

  const history = useHistory();
  const handleRowClick = useCallback(
    (id: string) => {
      history.push(`/bookings/${id}`);
    },
    [history],
  );

  const checkedBkgAgentContactID = booking?.BkgAgentContact ? booking.BkgAgentContact : undefined;
  const bookingAgent = useUserByAlphacomId(checkedBkgAgentContactID);

  const client = useClientById(booking?.ForwAdrId);

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

  return (
    <StyledTableRow tabIndex={-1} onClick={() => handleRowClick(booking.id)}>
      <Grid container spacing={2} style={{ paddingTop: '10px' }}>
        <Grid item lg={12} xs={12}>
          {booking && booking['ERP-BkgRef'] ? (
            <Fragment>
              <span className={classes.tableRowHeader}>
                <Typography variant="h5">File No. {booking['ERP-BkgRef']}</Typography>
                {!isImport(booking.Category) ? (
                  <Typography variant="body2" style={{ paddingLeft: 20 }}>
                    Refs: <LocRefs cargoDetails={booking.CargoDetails} />
                  </Typography>
                ) : null}
                {booking.pendingPayment && booking.inDispute && (
                  <Typography variant="body1" style={{ paddingLeft: 20 }}>
                    <WarningIcon fontSize="small" style={{ width: 14, height: 14 }} /> IN DISPUTE
                  </Typography>
                )}
              </span>
            </Fragment>
          ) : null}
        </Grid>
        <Grid item lg={12} xs={12}>
          <Grid container spacing={1}>
            <Grid item md={2} xs={12}>
              <InfoBoxItem
                title="Carrier"
                label1={booking && booking.CarrierID ? booking.CarrierID.toUpperCase() : ''}
                label2={
                  isAdmin && (booking['ERP-CarrierID'] || booking['ERP-ServiceID'])
                    ? booking['ERP-CarrierID'] + (booking['ERP-ServiceID'] && ` - ${booking['ERP-ServiceID']}`)
                    : ''
                }
                gutterBottom
              />
            </Grid>
            <Grid item md={3} xs={12}>
              {isAdmin && (
                <InfoBoxItem
                  title="Client"
                  label1={client ? client.name : booking.ForwAdrName || ''}
                  label2={booking && booking.ForwarderPersTxt ? booking.ForwarderPersTxt : booking.ForwAdrCity || ''}
                  gutterBottom
                />
              )}
            </Grid>
            <Grid item md={3} xs={12}>
              <InfoBoxItem title="Vessel" label1={booking.Vessel} label2={booking.Voyage} gutterBottom />
            </Grid>
            <Grid item container spacing={2} md={4} xs={12} style={{ display: 'flex', flexDirection: 'row' }}>
              <Grid item style={{ width: '45%' }}>
                <InfoBoxItem title="Status" label1={booking.BkgStatusText} gutterBottom />
              </Grid>
              <Grid item style={{ width: '25%' }}>
                <InfoBoxItem
                  title="Contact"
                  label1={
                    bookingAgent ? (
                      <Avatar
                        name={bookingAgent?.firstName + ' ' + bookingAgent?.lastName}
                        title={`${bookingAgent?.firstName + ' ' + bookingAgent?.lastName} <${
                          bookingAgent?.emailAddress ? bookingAgent?.emailAddress : null
                        }>`}
                        size="40"
                        round={true}
                        style={{ paddingLeft: '9px' }}
                      />
                    ) : (
                      <Avatar
                        name={booking.BkgAgentContactTxt}
                        title={`${booking.BkgAgentContactTxt} <${booking.BkgAgentContactEml}>`}
                        size="40"
                        round={true}
                        style={{ paddingLeft: '9px' }}
                      />
                    )
                  }
                  gutterBottom
                />
              </Grid>
              <Grid item style={{ width: '30%' }}>
                <InfoBoxItem
                  title="Progress"
                  label1={
                    <Box onClick={onProgressClick} style={{ width: '64px' }}>
                      <ShipmentProgress booking={booking!} />
                    </Box>
                  }
                  gutterBottom
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider style={{ paddingTop: '0px', paddingBottom: '0px' }} />
            </Grid>
            <Grid item md={2} xs={12}>
              <InfoBoxItem title="BL Number" label1={booking['BL-No']} gutterBottom />
            </Grid>
            <Grid item md={3} xs={12}>
              <InfoBoxItem
                title={isAdmin ? 'Customer reference' : 'Reference'}
                label1={booking['Cust-BkgRef']}
                gutterBottom
              />
            </Grid>
            <Grid item md={3} xs={12}>
              <Fragment>
                <Box style={{ display: 'flex', flexDirection: 'row' }}>
                  <Box style={{ width: '50%', paddingRight: '20px' }}>
                    <InfoBoxItem
                      IconComponent={ChevronRightIcon}
                      title="Departure"
                      label1={
                        <Fragment>
                          {booking.PlaceOfRecieptName}
                          <br />
                          <Typography variant={'body2'}>
                            ETS. {formatDateSafe(booking.ETS, DateFormats.LONG)}
                          </Typography>
                        </Fragment>
                      }
                      gutterBottom
                    />
                  </Box>
                  <Box style={{ width: '50%' }}>
                    <InfoBoxItem
                      IconComponent={LastPageIcon}
                      title="Arrival"
                      label1={
                        <Fragment>
                          {booking.FinalDestinationName}
                          <br />
                          <Typography variant={'body2'}>
                            ETA. {formatDateSafe(booking.FinalDestinationETA, DateFormats.LONG)}
                          </Typography>
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
                <InfoBoxItem title="Created On" label1={formatDate(booking.createdAt, 'dd.MM.yyyy')} gutterBottom />
              </Grid>
              <Grid item style={{ width: '55%' }}>
                <InfoBoxItem
                  title="Last updated"
                  label1={formatDistanceToNowConfigured(booking.updatedAt)}
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

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, isAdmin }) => {
  const [dialogData, setDialogData] = useState<Booking | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const classes = useStyles();

  const handleProgressClick = useCallback(
    (event: React.MouseEvent<unknown>, booking: Booking) => {
      event.stopPropagation();

      if (booking.Category === 'Export' || booking.Category === 'Import') {
        setIsDialogOpen(true);
        setDialogData(booking);
      }
    },
    [setIsDialogOpen, setDialogData],
  );

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  return (
    <Fragment>
      {!bookings ? (
        <MUIContainer maxWidth="md">
          <Paper>
            <ChartsCircularProgress />
          </Paper>
        </MUIContainer>
      ) : (
        bookings.map(booking => (
          <Card className={classes.card} key={booking.id}>
            <BookingRow
              isAdmin={isAdmin}
              booking={booking}
              onProgressClick={(event: React.MouseEvent<unknown>) => handleProgressClick(event, booking)}
            />
          </Card>
        ))
      )}
      <BoookingProgressDialog isOpen={isDialogOpen} handleClose={handleDialogClose} booking={dialogData!} />
    </Fragment>
  );
};

export default BookingsTable;
