import React, { useCallback } from 'react';
import { DropzoneArea } from 'material-ui-dropzone';
import useGlobalAppState from '../../hooks/useGlobalAppState';
import { DropzoneProps } from 'react-dropzone';
import { ChipProps } from '@material-ui/core';

interface Props {
  handleOnDrop: (file: File[]) => void;
  handleOnDelete?: (file: File) => void;
  currentFiles?: File[];
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
  currentFiles,
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

  const onChange = useCallback(
    (currentFiles: File[]) => {
      handleOnDrop(currentFiles);
    },
    [handleOnDrop],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const hasUnacceptedExtensions =
        acceptedExtensions &&
        !acceptedFiles.every(file => acceptedExtensions.includes(`.${file.name.split('.').pop()}` || ''));
      const hasDuplicates = currentFiles?.map(f => f.name)?.some(f => acceptedFiles.map(f => f.name).includes(f));

      if (hasUnacceptedExtensions) {
        return dispatch({
          type: 'SHOW_ERROR_SNACKBAR',
          duration: 4000,
          message: `Files must be of [${acceptedExtensions?.join(', ')}] format!`,
        });
      } else if (hasDuplicates) {
        return dispatch({
          type: 'SHOW_ERROR_SNACKBAR',
          duration: 4000,
          message: `Duplicate Files`,
        });
      }
    },
    [acceptedExtensions, currentFiles, dispatch],
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
      onChange={onChange}
      onDrop={onDrop}
      onDelete={file => {
        handleOnDelete && handleOnDelete(file);
      }}
    />
  );
};

export default DropZoneArea;
