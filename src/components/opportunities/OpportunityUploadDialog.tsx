import React, { useContext, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Opportunity } from '../../model/Opportunity';
import useUser from '../../hooks/useUser';
import DropZoneArea from '../dropzone/DropZoneArea';
import useGlobalAppState from '../../hooks/useGlobalAppState';
import { tryGetErrorMessage } from '../../utilities/errorHelper';

const useStyles = makeStyles(theme =>
  createStyles({
    closeModal: {
      position: 'absolute',
      top: '5px',
      right: '12px',
      width: '20px',
      height: '20px',
    },

    dialogContent: {
      paddingBottom: theme.spacing(3),
    },
    addBtn: {
      margin: theme.spacing(1),
    },
    progress: {
      position: 'absolute',
    },
    warningText: {
      color: theme.palette.warning.main,
      display: 'flex',
      alignItems: 'center',
      marginTop: theme.spacing(1),
    },
  }),
);

interface ParsedOpportunity extends Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'> {
  rowNumber: number;
  status: 'valid' | 'warning' | 'error';
  issues: string[];
}

interface OpportunityUploadDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  onUploadComplete?: () => void;
}

const OpportunityUploadDialog: React.FC<OpportunityUploadDialogProps> = ({
  isOpen,
  handleClose,
  onUploadComplete,
}) => {
  const classes = useStyles();
  const [parsedOpportunities, setParsedOpportunities] = useState<ParsedOpportunity[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [, dispatch] = useGlobalAppState();
  const [user] = useUser();

  const handleDownloadTemplate = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        'https://brunoni-allmarine.appspot.com/opportunities/xlsx-template',
        {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'opportunities-template.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error(`Failed to download template: ${response.statusText}`);
      }
    } catch (error) {
      dispatch({
        type: 'SHOW_ERROR_SNACKBAR',
        message: tryGetErrorMessage(error),
        duration: 4000,
      });
    }
  };

  const handleOnDrop = async (droppedFiles: File[]) => {
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      setParsedOpportunities([]);
    }
  };

  const handleOnDelete = () => {
    setParsedOpportunities([]);
    setFiles([]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setLoading(true);
    dispatch({ type: 'START_GLOBAL_LOADING' });

    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append('file', files[0]);

      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/opportunities/upload`,
        {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        const result = await response.json();
        dispatch({
          type: 'SHOW_SUCCESS_SNACKBAR',
          message: result.message || 'Successfully uploaded opportunities!',
          duration: 4000,
        });

        onUploadComplete?.();
        handleClose();
      } else {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
      }
    } catch (error) {
      dispatch({
        type: 'SHOW_ERROR_SNACKBAR',
        message: tryGetErrorMessage(error),
        duration: 4000,
      });
    } finally {
      setLoading(false);
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="dialog-title-opportunity-upload"
      fullWidth
    >
      <Box>
        <DialogTitle disableTypography id="dialog-title-opportunity-upload">
          <Typography variant="h4">Upload Opportunities (XLSX)</Typography>
          <IconButton onClick={handleClose} disabled={loading} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box>
            <DropZoneArea
              handleOnDrop={handleOnDrop}
              handleOnDelete={handleOnDelete}
              filesLimit={1}
              acceptedExtensions={['.xlsx', '.xls']}
              showPreviews={parsedOpportunities.length > 0}
              dropzoneProps={{ disabled: loading }}
              previewChipProps={{ disabled: loading }}
              dropzoneText={'Upload XLSX File'}
            />

            <Box display="flex" mt={2}>
              <Button
                onClick={handleUpload}
                variant="contained"
                color="primary"
                className={classes.addBtn}
                disabled={files.length === 0 || loading}
              >
                <CircularProgress
                  size={16}
                  color="inherit"
                  className={classes.progress}
                  style={{ visibility: loading ? 'visible' : 'hidden' }}
                />
                <span style={{ visibility: loading ? 'hidden' : 'visible' }}>Upload File</span>
              </Button>
              <Button
                onClick={handleDownloadTemplate}
                className={classes.addBtn}
                variant="contained"
                color="inherit"
                style={{ marginRight: 8 }}
              >
                Download Template
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default OpportunityUploadDialog;
