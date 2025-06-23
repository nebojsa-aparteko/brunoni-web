import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  PanelTitle: {
    alignSelf: 'center',
    marginRight: 16,
  },
});
const DeliveryGroupsContainer: React.FC = () => {
  const classes = useStyles();
  return (
    <Box flex={1} display="flex" flexDirection="column" m={1}>
      <Typography variant="h5" className={classes.PanelTitle}>
        Delivery Groups
      </Typography>
    </Box>
  );
};

export default DeliveryGroupsContainer;
