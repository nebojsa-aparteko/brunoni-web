import { useCallback, useState } from 'react';
import { fileWithExt } from '../components/bookings/checklist/ChecklistItemRow';
import firebase from '../firebase';
import useGlobalAppState from './useGlobalAppState';

const useSaveFiles = (storageBasePath: string) => {
  const [, dispatch] = useGlobalAppState();
  const [progress, setProgress] = useState(0);

  const saveFiles = useCallback(
    async (files: File[]): Promise<any> => {
      const uploadFile = async (file: File): Promise<any> => {
        return new Promise((resolve, reject) => {
          const fileWithExtension = fileWithExt(file.name);
          const storedFileName = `${fileWithExtension.name}_${new Date().getTime()}.${fileWithExtension.ext}`;
          let path = [storageBasePath, storedFileName].join('/');

          let storageRef = firebase.storage().ref(encodeURI(path));
          let uploadTask = storageRef.put(file);

          uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            snapshot => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress(progress);
              console.log('progress: ', progress);
            },
            error => {
              setProgress(0);
              reject(error);
              console.error(error);
              dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Failed to upload file!' });
            },
            () => {
              // success
              storageRef.updateMetadata({
                contentDisposition: `attachment; filename=${file.name}`,
              });
              uploadTask.snapshot.ref.getDownloadURL().then((downloadURL: string) => {
                resolve({ url: downloadURL, name: file.name, storedName: storedFileName });
              });
            },
          );
        });
      };

      const requests = files.map((file: File) => {
        return uploadFile(file).then(storedItem => {
          return storedItem;
        });
      });

      return Promise.all(requests);
    },
    [dispatch, storageBasePath],
  );

  return { saveFiles, progress };
};

export default useSaveFiles;
