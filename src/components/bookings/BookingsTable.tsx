import React, { useMemo, useState, Fragment, useCallback } from 'react';
import { useHistory } from 'react-router';
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Skeleton } from '@material-ui/lab';
import formatDate from 'date-fns/format';
import { Booking, CheckListData, CheckListDocument } from '../../model/Booking';
import useClients from '../../hooks/useClients';
import CheckList from './CheckList';
import firebase from '../../firebase';

const useStyles = makeStyles((theme: Theme) =>
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

interface AddOrReplacePayload {
  key: string;
  value: boolean | CheckListDocument[];
}

const formatDateString = (date: string) => formatDate(new Date(date), 'd. MMMM');

const formatEstimatedDate = (date: string) => {
  if (date.indexOf('.') < 0) {
    return date;
  }

  let dateParts = date.split('.');

  return [dateParts[0], dateParts[1]].join('.');
};

const ShipmentProgress: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.progress}>
      <div className={classes.progressBar} role="progressbar" style={{ width: '40%' }}></div>
    </div>
  );
};

const BoookingProgressDialog: React.FC<ProgressDialogProps> = ({ isOpen, handleClose, booking, showCompanyInfo }) => {
  const classes = useStyles();
  const [isBusy, setIsBusy] = useState(false);
  const clients = useClients();

  const client = useMemo(() => clients?.find(client => client.id === booking?.ForwAdrId), [clients, booking]);

  const saveCheckListChanges = useCallback(
    async (data: CheckListData[]) => {
      setIsBusy(true);

      try {
        await firebase
          .firestore()
          .collection('bookings-extension')
          .doc(booking?.id)
          .get()
          .then(docRef => {
            // update existing booking extension
            if (docRef && docRef.data()) {
              return firebase
                .firestore()
                .collection('bookings-extension')
                .doc(booking?.id)
                .update({
                  checklists: data,
                });
            } else {
              // create new booking extension
              return firebase
                .firestore()
                .collection('bookings-extension')
                .doc(booking?.id)
                .set({
                  checklists: data,
                });
            }
          })
          .catch(error => console.log(error));
      } finally {
        setIsBusy(false);
      }
    },
    [booking],
  );

  const getStorageBasePath = useCallback((): string => {
    return ['booking-documents', 'clients', `${client?.id}`, 'bookings', `${booking?.id}`].join('/');
  }, [booking, client]);

  const saveFiles = useCallback(
    async (files: File[], isAdmin: boolean): Promise<any> => {
      const uploadFile = async (file: File): Promise<any> => {
        return new Promise((resolve, reject) => {
          let path = [getStorageBasePath(), `${file.name}`].join('/');
          let storageRef = firebase.storage().ref(encodeURI(path));
          let uploadTask = storageRef.put(file);

          uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            snapshot => {
              // in progress
              // if(snapshot.state === firebase.storage.TaskState.RUNNING) {
              //   // ex. calculate progress
              // }
            },
            error => {
              reject(error);
            },
            () => {
              // success
              uploadTask.snapshot.ref.getDownloadURL().then((downloadURL: string) => {
                resolve(downloadURL);
              });
            },
          );
        });
      };

      const requests = files.map((file: File) => {
        return uploadFile(file).then(downloadURL => {
          return {
            isAdmin: isAdmin,
            name: file.name,
            url: downloadURL,
          };
        });
      });

      return Promise.all(requests);
    },
    [getStorageBasePath],
  );

  const deleteFile = useCallback(
    async (name: any): Promise<any> => {
      return new Promise((resolve, reject) => {
        const path = [getStorageBasePath(), `${name}`].join('/');
        const storageRef = firebase.storage().ref();
        const documentRef = storageRef.child(encodeURI(path));

        documentRef
          .delete()
          .then(() => resolve(name))
          .catch(error => reject(error));
      });
    },
    [getStorageBasePath],
  );

  const addOrReplace = useCallback(
    (label: string, data: AddOrReplacePayload) => {
      if (!booking) return;

      if (!('checklists' in booking)) {
        booking.checklists = [];
      }

      const index: number | undefined = booking?.checklists?.findIndex((item: CheckListData) => item.label === label);

      const key: string = data.key;
      let value: any;

      if (booking.checklists && typeof index !== 'undefined' && index > -1) {
        // update existing entry
        let existingEntry: any = booking.checklists[index];

        if (typeof data.value === 'boolean') {
          value = data.value;
        }

        if (Array.isArray(data.value)) {
          value = [...(existingEntry.documents || []), ...data.value];
        }

        existingEntry[key] = value;
      } else {
        // create new entry
        let newEntry: any = {
          [key]: data.value,
          label,
        };

        if (booking && booking.checklists) {
          booking.checklists.push(newEntry);
        }
      }

      return booking.checklists;
    },
    [booking],
  );

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, label: string) => {
      const checklistsData = addOrReplace(label, { key: 'checked', value: event.target.checked });

      if (!checklistsData) return;

      saveCheckListChanges(checklistsData);
    },
    [addOrReplace, saveCheckListChanges],
  );

  const handleFilesDrop = useCallback(
    (acceptedFiles: File[], label: string, isAdmin: boolean) => {
      setIsBusy(true);

      saveFiles(acceptedFiles, isAdmin)
        .then((documents: CheckListDocument[]) => {
          const checklistsData = addOrReplace(label, { key: 'documents', value: documents });

          if (!checklistsData) {
            setIsBusy(false);
            return;
          }

          setIsBusy(false);

          saveCheckListChanges(checklistsData);
        })
        .catch(err => {
          setIsBusy(false);

          console.error(err);
        });
    },
    [saveFiles, addOrReplace, saveCheckListChanges],
  );

  const handleFileRemoval = useCallback(
    (label: string, name: string) => {
      setIsBusy(true);

      deleteFile(name)
        .then(fileName => {
          const checklistsData = booking?.checklists?.map(item => {
            if (item.label === label) {
              item.documents = item?.documents?.filter(document => document.name !== fileName);
            }

            return item;
          });

          if (!checklistsData) {
            setIsBusy(false);
            return;
          }

          setIsBusy(false);
          saveCheckListChanges(checklistsData);
        })
        .catch(error => {
          console.error('File not deleted due to an error: ', error);
          setIsBusy(false);
        });
    },
    [booking, deleteFile, saveCheckListChanges],
  );

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md">
      <DialogTitle disableTypography id="dialog-title-check-list">
        <Typography variant="h4">{booking?.CarrierID.toUpperCase()}</Typography>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <CheckList
          booking={booking}
          showCompanyInfo={showCompanyInfo}
          onCheckboxChange={handleCheckboxChange}
          onFilesDrop={handleFilesDrop}
          onDelete={handleFileRemoval}
        />
      </DialogContent>
      <Backdrop open={isBusy} className={classes.checkListBackdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
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
        {booking.ForwPersID ? <Typography variant="body2">{booking.ForwPersID}</Typography> : null}
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
        ETS. {formatEstimatedDate(booking.ETS)}
      </TableCell>
      <TableCell>
        {booking.FinalDestinationName}
        <br />
        ETA. {formatEstimatedDate(booking.ETA)}
      </TableCell>
      <TableCell>{booking['BL-No']}</TableCell>
      <TableCell>{booking['Cust-BkgRef']}</TableCell>
      <TableCell>{booking.BkgStatusText}</TableCell>
      <TableCell>{formatDateString(booking.TimeStamp)}</TableCell>
      <TableCell className={classes.avatarCell}>
        <img
          className={classes.avatar}
          src="https://trello-members.s3.amazonaws.com/5db6fc90458fa40143f689f3/85b18ae1d817ab32d6b577184905713e/170.png"
          alt="Nenad"
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
