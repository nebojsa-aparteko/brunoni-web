import React, { useCallback } from 'react';
import { DropzoneArea } from 'material-ui-dropzone';
import useGlobalAppState from '../../hooks/useGlobalAppState';
import { DropzoneProps } from 'react-dropzone';
import { ChipProps } from '@material-ui/core';

interface Props {
  handleOnDrop: (file: File) => void;
  handleOnDelete: (file: File) => void;
  filesLimit?: number;
  acceptedExtensions?: string[];
  showPreviews?: boolean;
  dropzoneProps?: DropzoneProps;
  previewChipProps?: ChipProps<'div'>;
  dropzoneText?: string;
  dropzoneClass?: string;
  initialFiles?: (string | File)[];
}

const DropZoneArea: React.FC<Props> = ({
  handleOnDrop,
  handleOnDelete,
  filesLimit = 1,
  acceptedExtensions,
  showPreviews = true,
  dropzoneProps,
  previewChipProps,
  dropzoneText = 'Drag and drop a file here or click',
  dropzoneClass,
  initialFiles,
}) => {
  const [, dispatch] = useGlobalAppState();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (
        acceptedExtensions &&
        !acceptedFiles.every(file => acceptedExtensions.includes(`.${file.name.split('.').pop()}` || ''))
      ) {
        return dispatch({
          type: 'SHOW_ERROR_SNACKBAR',
          duration: 4000,
          message: `File must be of [${acceptedExtensions.join(', ')}] format!`,
        });
      }
      acceptedFiles.forEach(file => {
        handleOnDrop(file);
      });
    },
    [acceptedExtensions, dispatch, handleOnDrop],
  );

  return (
    <DropzoneArea
      initialFiles={initialFiles || []}
      dropzoneClass={dropzoneClass}
      dropzoneText={dropzoneText}
      disableRejectionFeedback={true}
      acceptedFiles={acceptedExtensions}
      showPreviews={showPreviews}
      showPreviewsInDropzone={false}
      showAlerts={['error']}
      useChipsForPreview
      filesLimit={filesLimit}
      dropzoneProps={dropzoneProps}
      alertSnackbarProps={{ autoHideDuration: 4000 }}
      previewChipProps={previewChipProps}
      previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
      previewText="Selected files"
      onDrop={onDrop}
      onDelete={file => {
        handleOnDelete(file);
      }}
    />
  );
};

export default DropZoneArea;
