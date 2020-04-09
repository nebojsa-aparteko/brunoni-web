import { ChecklistItemValue, FieldType } from './checklistItemsData';
import { TableCell, TextField } from '@material-ui/core';
import DropZone from '../../DropZone';
import React, { Fragment, useCallback, useMemo } from 'react';
import debounce from 'lodash/fp/debounce';
import firebase from '../../../firebase';
import { CheckListDocument } from '../../../model/Booking';

interface Props {
  valuePath: string; // admin or customer
  checklistValue: ChecklistItemValue;
  saveChecklistChanges: any;
  storageBasePath: string;
}

const ChecklistItemValueComponent: React.FC<Props> = ({
  valuePath,
  checklistValue,
  saveChecklistChanges,
  storageBasePath,
}) => {
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
    async (files: File[]): Promise<any> => {
      const uploadFile = async (file: File): Promise<any> => {
        return new Promise((resolve, reject) => {
          let path = [storageBasePath, `${file.name}`].join('/');
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
            name: file.name,
            url: downloadURL,
          };
        });
      });

      return Promise.all(requests);
    },
    [storageBasePath],
  );

  const deleteFile = useCallback(
    async (name: any): Promise<any> => {
      return new Promise((resolve, reject) => {
        const path = [storageBasePath, `${name}`].join('/');
        const storageRef = firebase.storage().ref();
        const documentRef = storageRef.child(encodeURI(path));

        documentRef
          .delete()
          .then(() => resolve(name))
          .catch(error => reject(error));
      });
    },
    [storageBasePath],
  );

  const handleFilesDrop = useCallback(
    (acceptedFiles: File[]) => {
      saveFiles(acceptedFiles)
        .then((documents: CheckListDocument[]) => {
          saveChecklistChanges(valuePath, {
            files: [...(checklistValue.files ? checklistValue.files : []), ...documents],
            type: FieldType.FILE,
          });
        })
        .catch(err => {
          console.error(`Error while storing files ${JSON.stringify(checklistValue, null, 2)}`, err);
        });
    },
    [saveFiles, saveChecklistChanges],
  );

  const handleFileRemoval = useCallback(
    (name: string) => {
      deleteFile(name)
        .then(fileName => {
          saveChecklistChanges(valuePath, {
            type: FieldType.FILE,
            files: checklistValue.files?.filter(file => file.url !== fileName),
          });
        })
        .catch(error => {
          console.error('File not deleted due to an error: ', error);
        });
    },
    [deleteFile, saveChecklistChanges],
  );
  return (
    <Fragment>
      {checklistValue.type === FieldType.FILE && (
        <TableCell>
          <DropZone
            onDrop={(files: []) => handleFilesDrop(files)}
            documents={checklistValue.files || []}
            onDelete={(name: string) => handleFileRemoval(name)}
          />
        </TableCell>
      )}
      {checklistValue.type === FieldType.TEXT && (
        <TableCell>
          <TextField
            variant="outlined"
            multiline
            rowsMax="2"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => saveInput({ ...event })}
            defaultValue={checklistValue.text || ''}
          />
        </TableCell>
      )}
      {checklistValue.type === FieldType.CHECKMARK && (
        <TableCell>
          <p>
            <a href={'#'}>Form to fill</a>
          </p>
          {/*Place checkbox here*/}
        </TableCell>
      )}
    </Fragment>
  );
};

export default ChecklistItemValueComponent;
