import React from 'react';
import { Button, CircularProgress, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  button: {
    maxWidth: '15em',
    minHeight: '4em',
  },
}));

const LoadingButton: React.FC<Props> = ({ loading, handleClick }) => {
  const classes = useStyles();

  return (
    <Button
      disabled={loading}
      startIcon={loading ? <CircularProgress /> : null}
      className={classes.button}
      variant="contained"
      color="primary"
      onClick={handleClick}
    >
      {loading ? '' : 'Search'}
    </Button>
  );
};

export default LoadingButton;

interface Props {
  loading: boolean;
  handleClick: () => void;
}
