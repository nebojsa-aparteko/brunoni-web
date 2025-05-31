import React from 'react';
import { Button, CircularProgress, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  progress: {
    position: 'absolute',
  },
}));

export interface SaveButtonProps {
  handleSave: () => void;
  loading?: boolean;
  title?: string;
  showSaveButton?: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  handleSave,
  loading,
  showSaveButton = true,
  title = `Save`,
}) => {
  const classes = useStyles();

  return showSaveButton ? (
    <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
      <CircularProgress
        size={16}
        color="inherit"
        className={classes.progress}
        style={{ visibility: loading ? 'visible' : 'hidden' }}
      />
      <span style={{ visibility: loading ? 'hidden' : 'visible' }}>{title}</span>
    </Button>
  ) : null;
};

interface CancelButtonProps {
  handleCancel: () => void;
}

export const CancelButton: React.FC<CancelButtonProps> = ({ handleCancel }) => {
  return (
    <Button onClick={handleCancel} variant="contained" color="primary">
      Cancel
    </Button>
  );
};

export default SaveButton;
