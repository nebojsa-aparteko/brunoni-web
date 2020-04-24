import Avatar from 'react-avatar';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import {
  Box,
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
  Table,
  TableBody,
  TableRow,
  Theme,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import formatDate from 'date-fns/format';
import { Booking, CargoDetail } from '../../model/Booking';
import useClients from '../../hooks/useClients';
import CheckList from './checklist/CheckList';
import theme from '../../theme';
import InfoBoxItem from '../InfoBoxItem';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { withStyles } from '@material-ui/styles';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { isImport } from './BookingView';

const useStyles = makeStyles(() =>
  createStyles({
    button: {
      position: 'relative',
    },
    progressButton: {
      position: 'absolute',
    },
    tableRow: {
      '& td': {
        whiteSpace: 'nowrap',
      },
      '&:hover': {
        backgroundColor: 'rgba(161,213,255,0.15) !important',
      },
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
    checklistDialogBody: {
      width: theme.spacing(100),
    },
    checklistDialogContent: {
      paddingBottom: theme.spacing(3),
    },
    actionBarGridItem: {
      marginRight: 0,
      textAlign: 'right',
    },
    rowWrapper: {
      paddingTop: '10px',
      paddingLeft: '20px',
      paddingRight: '20px',
      paddingBottom: '10px',
    },
  }),
);

interface BookingsTableProps {
  bookings: Booking[] | undefined;
  isAdmin?: boolean;
}

interface BookingRowProps {
  booking: Booking;
  onProgressClick: any;
  isAdmin?: boolean;
}
interface LocRefProps {
  cargoDetails: CargoDetail[];
}

interface CargoDetailLocRefProps {
  cargoDetail: CargoDetail;
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

const BoookingProgressDialog: React.FC<ProgressDialogProps> = ({ isOpen, handleClose, booking }) => {
  const classes = useStyles();

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md">
      <span className={classes.checklistDialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">{booking?.CarrierID.toUpperCase()}</Typography>
          {booking && booking['BL-No'] ? <Typography variant="h6">BL Number: {booking['BL-No']}</Typography> : null}
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.checklistDialogContent}>
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
              ? cargoDetail.LocRefs.map(locRef => (locRef && locRef.LocRef ? ' / ' + locRef.LocRef : '')).join('')
              : ''
            : '',
        )
        .join('')
        .substring(3)}
    </Fragment>
  ) : null;
};

const BookingRow: React.FC<BookingRowProps> = ({ isAdmin, booking, onProgressClick }) => {
  const classes = useStyles();
  const clients = useClients();

  const history = useHistory();
  const handleRowClick = useCallback(
    (id: string) => {
      history.push(`/bookings/${id}`);
    },
    [history],
  );

  const client = useMemo(() => clients?.find(client => client.id === booking?.ForwAdrId), [clients, booking]);

  const StyledTableRow = withStyles((theme: Theme) =>
    createStyles({
      root: {
        '&:nth-of-type(even)': {
          backgroundColor: theme.palette.background.default,
        },
      },
    }),
  )(TableRow);

  return (
    <StyledTableRow
      hover
      tabIndex={-1}
      className={classes.tableRow}
      onClick={() => handleRowClick(booking.id)}
      key={booking.id}
    >
      <Box mb={1}>
        <Box className={classes.rowWrapper}>
          <Grid container spacing={2} style={{ paddingTop: '10px' }}>
            <Grid item lg={12} xs={12}>
              {isImport(booking.Category) ? (
                booking && booking['ERP-BkgRef'] ? (
                  <Typography variant="h5">BL Number: {booking['ERP-BkgRef']}</Typography>
                ) : null
              ) : booking && booking['ERP-BkgRef'] ? (
                <Fragment>
                  <span className={classes.tableRowHeader}>
                    <Typography variant="h5">BL Number: {booking['ERP-BkgRef']}</Typography>
                    <Typography variant="body2" style={{ paddingLeft: '20px' }}>
                      Refs: <LocRefs cargoDetails={booking.CargoDetails} />
                    </Typography>
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
                      isAdmin && (booking['ERP-CarrierID'] || booking['ERP-ServiceID']) ? (
                        <Typography variant="body2">
                          {booking['ERP-CarrierID'] && booking['ERP-CarrierID']}
                          {booking['ERP-CarrierID'] && booking['ERP-ServiceID'] ? ' - ' : null}
                          {booking['ERP-ServiceID'] && booking['ERP-ServiceID']}
                        </Typography>
                      ) : (
                        ''
                      )
                    }
                    gutterBottom
                  />
                </Grid>
                <Grid item md={3} xs={12}>
                  <InfoBoxItem
                    title="Client"
                    label1={client ? client.name : ''}
                    label2={booking && booking.ForwarderPersTxt ? booking.ForwarderPersTxt : ''}
                    gutterBottom
                  />
                </Grid>
                <Grid item md={3} xs={12}>
                  <InfoBoxItem title="Vessel" label1={booking.Vessel} label2={booking.Voyage} gutterBottom />
                </Grid>
                <Grid item md={2} xs={12}>
                  <InfoBoxItem title="Status" label1={booking.BkgStatusText} gutterBottom />
                </Grid>
                <Grid item md={2} xs={12}>
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
                              <Typography variant={'body2'}>ETS. {formatDate(booking.ETS, 'dd.MM.yyyy')}</Typography>
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
                              <Typography variant={'body2'}>ETA. {formatDate(booking.ETA, 'dd.MM.yyyy')}</Typography>
                            </Fragment>
                          }
                          gutterBottom
                        />
                      </Box>
                    </Box>
                  </Fragment>
                </Grid>
                <Grid item md={2} xs={12}>
                  <InfoBoxItem title="Created On" label1={formatDate(booking.createdAt, 'dd.MM.yyyy')} gutterBottom />
                </Grid>
                <Grid item md={2} xs={12}>
                  <InfoBoxItem
                    title="Contact"
                    label1={
                      <Avatar
                        name={booking.BkgAgentContactTxt}
                        title={`${booking.BkgAgentContactTxt} <${booking.BkgAgentContactEml}>`}
                        size="40"
                        round={true}
                      />
                    }
                    gutterBottom
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Divider />
    </StyledTableRow>
  );
};

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, isAdmin }) => {
  const [dialogData, setDialogData] = useState<Booking | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      <Table>
        <TableBody>
          {!bookings ? (
            <MUIContainer maxWidth="md">
              <Paper>
                <ChartsCircularProgress />
              </Paper>
            </MUIContainer>
          ) : (
            bookings.map(booking => (
              <BookingRow
                key={`booking-row-${booking.id}`}
                isAdmin={isAdmin}
                booking={booking}
                onProgressClick={(event: React.MouseEvent<unknown>) => handleProgressClick(event, booking)}
              />
            ))
          )}
        </TableBody>
      </Table>
      <BoookingProgressDialog isOpen={isDialogOpen} handleClose={handleDialogClose} booking={dialogData!} />
    </Fragment>
  );
};

export default BookingsTable;
