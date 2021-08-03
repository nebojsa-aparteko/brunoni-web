import React from 'react';
import { Button, CircularProgress, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    maxWidth: '15em',
    minHeight: '4em',
  },
}));

const LoadingButton: React.FC<Props> = ({ loading, setLoading }) => {
  const classes = useStyles();

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('searched!');
    }, 2000);
  };

  return (
    <Button
      disabled={loading}
      startIcon={loading ? <CircularProgress /> : null}
      className={classes.button}
      variant="contained"
      color="primary"
      onClick={handleSearch}
    >
      {loading ? '' : 'Search'}
    </Button>
  );
};

export default LoadingButton;

interface Props {
  loading: boolean;
  setLoading: (value: ((prevState: boolean) => boolean) | boolean) => void;
}
