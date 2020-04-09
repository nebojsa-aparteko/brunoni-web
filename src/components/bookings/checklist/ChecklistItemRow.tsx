import React, { useCallback, useEffect, useMemo } from 'react';
import debounce from 'lodash/fp/debounce';
import {
  Checkbox,
  createStyles,
  makeStyles,
  TableCell,
  TableRow,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import { ChecklistItem, ChecklistItemValue, FieldType } from './checklistItemsData';
import DropZone from '../../DropZone';
import { useSnackbar } from 'notistack';
import useClients from '../../../hooks/useClients';
import { Booking, CheckListDocument } from '../../../model/Booking';
import firebase from '../../../firebase';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableRow: {
      height: '55px',
      '& td': {
        whiteSpace: 'nowrap',
        padding: '6px 12px',
      },
      ['@media print']: {
        '& td': {
          padding: theme.spacing(0),
        },
      },
    },
  }),
);
const ChecklistItemRow = ({ booking, checklistItem, isAdmin }: ChecklistItemRowProp) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const clients = useClients();
  const client = useMemo(() => clients?.find(client => client.id === booking?.ForwAdrId), [clients, booking]);

  const getStorageBasePath = useCallback((): string => {
    return ['booking-documents', 'clients', `${client?.id}`, 'bookings', `${booking?.id}`].join('/');
  }, [booking, client]);

  const saveChecklistChanges = useCallback(
    async (field: string, value: ChecklistItemValue | boolean) => {
      try {
        await firebase
          .firestore()
          .collection('bookings')
          .doc(booking?.id)
          .collection('checklist')
          .doc(checklistItem.id)
          .update(field, value)
          .then(() =>
            enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
              variant: 'success',
              autoHideDuration: 1000,
            }),
          )
          .catch((error: any) => console.log(error));
      } catch (e) {
        console.log(e);
      }
    },
    [checklistItem],
  );

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      saveChecklistChanges('checked', event.target.checked);
    },
    [saveChecklistChanges],
  );
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      saveChecklistChanges('valueCustomer', {
        type: FieldType.TEXT,
        text: event.target.value,
      });
    },
    [saveChecklistChanges],
  );
  const saveInput = useMemo(() => debounce(300, handleInputChange), [handleInputChange]);

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

  const handleFilesDrop = useCallback(
    (acceptedFiles: File[], label: string, isAdmin: boolean) => {
      saveFiles(acceptedFiles, isAdmin)
        .then((documents: CheckListDocument[]) => {
          if (isAdmin) {
            saveChecklistChanges('valueAdmin', {
              files: [...(checklistItem.valueAdmin?.files ? checklistItem.valueAdmin?.files : []), ...documents],
              type: FieldType.FILE,
            });
          } else {
            saveChecklistChanges('valueCustomer', {
              files: [...(checklistItem.valueCustomer?.files ? checklistItem.valueCustomer?.files : []), ...documents],
              type: FieldType.FILE,
            });
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    [saveFiles, saveChecklistChanges],
  );

  const handleFileRemoval = useCallback(
    (name: string, isAdmin: boolean) => {
      deleteFile(name)
        .then(fileName => {
          if (isAdmin) {
            saveChecklistChanges('valueAdmin', {
              type: FieldType.FILE,
              files: checklistItem.valueAdmin?.files?.filter(file => file.url !== fileName),
            });
          } else {
            saveChecklistChanges('valueCustomer', {
              type: FieldType.FILE,
              files: checklistItem.valueCustomer?.files?.filter(file => file.url !== fileName),
            });
          }
        })
        .catch(error => {
          console.error('File not deleted due to an error: ', error);
        });
    },
    [deleteFile, saveChecklistChanges],
  );
  return (
    <TableRow selected={checklistItem.checked} className={classes.tableRow} key={checklistItem.id}>
      <TableCell>
        <Checkbox checked={checklistItem.checked} disabled={!isAdmin} onChange={event => handleCheckboxChange(event)} />
      </TableCell>

      <TableCell>{checklistItem.label}</TableCell>
      {checklistItem.valueCustomer?.type === FieldType.FILE ? (
        <TableCell>
          <DropZone
            onDrop={(files: []) => handleFilesDrop(files, checklistItem.id, false)}
            documents={checklistItem.valueCustomer?.files || []}
            onDelete={(name: string) => handleFileRemoval(name, false)}
          />
        </TableCell>
      ) : null}
      {checklistItem.valueCustomer?.type === FieldType.TEXT ? (
        <TableCell>
          <TextField
            variant="outlined"
            multiline
            rowsMax="2"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => saveInput({ ...event })}
            defaultValue={checklistItem.valueCustomer?.text || ''}
          />
        </TableCell>
      ) : null}
      {checklistItem.valueCustomer?.type === FieldType.BASIC ? <TableCell>&nbsp; </TableCell> : null}
      {/*{!checklistItem.valueCustomer ? }*/}
      {isAdmin ? (
        <TableCell>
          <DropZone
            onDrop={(files: []) => handleFilesDrop(files, checklistItem.id, true)}
            documents={checklistItem.valueAdmin?.files || []}
            onDelete={(name: string) => handleFileRemoval(name, isAdmin)}
          />
        </TableCell>
      ) : null}
    </TableRow>
  );
};
interface ChecklistItemRowProp {
  checklistItem: ChecklistItem;
  isAdmin: boolean | undefined;
  booking: Booking | undefined;
}
export default ChecklistItemRow;
