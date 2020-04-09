import Avatar from 'react-avatar';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import {
  Backdrop,
  CircularProgress,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Skeleton } from '@material-ui/lab';
import formatDate from 'date-fns/format';
import { Booking } from '../../model/Booking';
import useClients from '../../hooks/useClients';
import CheckList from './checklist/CheckList';
import theme from '../../theme';

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
    checklistDialog: {
      paddingBottom: theme.spacing(3),
    },
  }),
);

interface BookingsTableProps {
  bookings: Booking[] | undefined;
  showCompanyInfo?: boolean;
}

interface BookingRowProps {
  booking: Booking;
  onProgressClick: any;
  onClick: any;
  showCompanyInfo?: boolean;
}

interface ProgressDialogProps {
  isOpen: boolean;
  booking: Booking | undefined;
  handleClose: any;
  showCompanyInfo?: boolean;
}

const ShipmentProgress: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.progress}>
      <div className={classes.progressBar} role="progressbar" style={{ width: '40%' }} />
    </div>
  );
};

const BoookingProgressDialog: React.FC<ProgressDialogProps> = ({ isOpen, handleClose, booking, showCompanyInfo }) => {
  const classes = useStyles();

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md">
      <DialogTitle disableTypography id="dialog-title-check-list">
        <Typography variant="h4">{booking?.CarrierID.toUpperCase()}</Typography>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.checklistDialog}>
        <CheckList booking={booking} showCompanyInfo={showCompanyInfo} />
      </DialogContent>
    </Dialog>
  );
};

const BookingRow: React.FC<BookingRowProps> = ({ showCompanyInfo, booking, onClick, onProgressClick }) => {
  const classes = useStyles();
  const clients = useClients();

  const client = useMemo(() => clients?.find(client => client.id === booking?.ForwAdrId), [clients, booking]);

  const clientInfo = useMemo(() => {
    if (!showCompanyInfo) return null;

    if (!client) {
      return <TableCell>{booking.ForwAdrId}</TableCell>;
    }

    return (
      <TableCell>
        {client.name}
        {booking.ForwarderPersTxt ? <Typography variant="body2">{booking.ForwarderPersTxt}</Typography> : null}
      </TableCell>
    );
  }, [showCompanyInfo, client, booking]);

  return (
    <TableRow hover tabIndex={-1} className={classes.tableRow} onClick={onClick} key={booking.id}>
      {clientInfo}
      <TableCell className={classes.textEmphasized}>
        {booking.CarrierID.toUpperCase()}
        {showCompanyInfo && (booking['ERP-CarrierID'] || booking['ERP-ServiceID']) ? (
          <Typography variant="body2">
            {booking['ERP-CarrierID'] && booking['ERP-CarrierID']}
            {booking['ERP-CarrierID'] && booking['ERP-ServiceID'] ? ' - ' : null}
            {booking['ERP-ServiceID'] && booking['ERP-ServiceID']}
          </Typography>
        ) : null}
      </TableCell>
      <TableCell>
        {booking.Vessel}
        <br />
        Voyage Number {booking.Voyage}
      </TableCell>
      <TableCell>
        {booking.PlaceOfRecieptName}
        <br />
        ETS. {formatDate(booking.ETS, 'dd.MM.yyyy')}
      </TableCell>
      <TableCell>
        {booking.FinalDestinationName}
        <br />
        ETA. {formatDate(booking.ETA, 'dd.MM.yyyy')}
      </TableCell>
      <TableCell>{booking['BL-No']}</TableCell>
      <TableCell>{booking['Cust-BkgRef']}</TableCell>
      <TableCell>{booking.BkgStatusText}</TableCell>
      <TableCell>{formatDate(booking.BkgCreateTimeStamp, 'dd.MM.yyyy')}</TableCell>
      <TableCell className={classes.avatarCell}>
        <Avatar
          name={booking.BkgAgentContactTxt}
          title={`${booking.BkgAgentContactTxt} <${booking.BkgAgentContactEml}>`}
          size="40"
          round={true}
        />
      </TableCell>
      <TableCell onClick={onProgressClick}>
        <ShipmentProgress />
      </TableCell>
    </TableRow>
  );
};

const BookingsTableBodySekeleton: React.FC = () => (
  <Fragment>
    {[...Array(10)].map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton width={50} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={65} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
      </TableRow>
    ))}
  </Fragment>
);

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, showCompanyInfo }) => {
  const classes = useStyles();
  const history = useHistory();
  const [dialogData, setDialogData] = useState<Booking | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRowClick = useCallback(
    (event: React.MouseEvent<unknown>, id: string) => {
      history.push(`/bookings/${id}`);
    },
    [history],
  );

  const handleProgressClick = useCallback((event: React.MouseEvent<unknown>, booking: Booking) => {
    event.stopPropagation();

    if (booking.Category === 'Export' || booking.Category === 'Import') {
      setIsDialogOpen(true);
      setDialogData(booking);
    }
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  return (
    <Fragment>
      <Table>
        <TableHead>
          <TableRow>
            {showCompanyInfo && <TableCell>Client</TableCell>}
            <TableCell>Carrier</TableCell>
            <TableCell>Vessel</TableCell>
            <TableCell>Origin</TableCell>
            <TableCell>Destination</TableCell>
            <TableCell>Booking Number</TableCell>
            <TableCell>Your Reference</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell className={classes.avatarCell}>Contact</TableCell>
            <TableCell>Progress</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!bookings ? (
            <BookingsTableBodySekeleton />
          ) : (
            bookings.map(booking => (
              <BookingRow
                key={`booking-row-${booking.id}`}
                showCompanyInfo={showCompanyInfo}
                booking={booking}
                onClick={(event: React.MouseEvent<unknown>) => handleRowClick(event, booking.id)}
                onProgressClick={(event: React.MouseEvent<unknown>) => handleProgressClick(event, booking)}
              />
            ))
          )}
        </TableBody>
      </Table>
      <BoookingProgressDialog
        isOpen={isDialogOpen}
        handleClose={handleDialogClose}
        booking={dialogData}
        showCompanyInfo={showCompanyInfo}
      />
    </Fragment>
  );
};

export default BookingsTable;
