import { Popper } from '@material-ui/core';
import React from 'react';

const popperStyles = () => ({
  popper: {
    width: 'fit-content',
  },
});

const FitContentPopper = function(props: any) {
  const classes = popperStyles();

  return <Popper {...props} style={classes.popper} placement="bottom-start" />;
};

export default FitContentPopper;
