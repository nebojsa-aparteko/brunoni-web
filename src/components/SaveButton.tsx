import React from 'react';
import { Button, CircularProgress, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  progress: {
    position: 'absolute',
  },
  addBtn: {
    margin: theme.spacing(1),
  },
}));

interface Props {
  handleSave: () => void;
  loading: boolean;
  title?: string;
}

const SaveButton: React.FC<Props> = ({ handleSave, loading, title = `Save Documents` }) => {
  const classes = useStyles();

  return (
    <Button onClick={handleSave} variant="contained" color="primary" className={classes.addBtn} disabled={loading}>
      <CircularProgress
        size={16}
        color="inherit"
        className={classes.progress}
        style={{ visibility: loading ? 'visible' : 'hidden' }}
      />
      <span style={{ visibility: loading ? 'hidden' : 'visible' }}>{title}</span>
    </Button>
  );
};

export default SaveButton;
