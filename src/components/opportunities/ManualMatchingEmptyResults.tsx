import React from 'react';
import { makeStyles, Paper, Typography } from '@material-ui/core';

interface Props {
  message?: string;
}

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(5),
    textAlign: 'center',
  },
}));

const ManualMatchingEmptyResults: React.FC<Props> = ({
  message = 'No manual matching opportunities found for your filter criteria. Try changing filters.',
}) => {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Typography variant="h6" color="textSecondary">
        {message}
      </Typography>
    </Paper>
  );
};

export default ManualMatchingEmptyResults;
