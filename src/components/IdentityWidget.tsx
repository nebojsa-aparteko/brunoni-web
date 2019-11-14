import React from 'react';
import { Theme, makeStyles, CircularProgress } from '@material-ui/core';

import LoginWidget from './LoginWidget';
import useUser from '../hooks/useUser';

import UserWidget from './UserWidget';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  progress: {
    marginLeft: theme.spacing(1),
  },
}));

const IdentityWidget: React.FC<Props> = ({}) => {
  const classes = useStyles();
  const user = useUser();

  switch (user) {
    case undefined:
      return <CircularProgress size={24} className={classes.progress} />;
    case null:
      return <LoginWidget />;
    default:
      return <UserWidget />;
  }
};

export default IdentityWidget;
