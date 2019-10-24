import React from 'react';
import background from '../assets/background.jpg';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';

interface Props extends WithStyles<typeof styles> {}

const Hero: React.FC<Props> = ({ classes }) => <div className={classes.container} />;

const styles = (theme: Theme) =>
  createStyles({
    container: {
      height: 0,
      padding: `${20000 / 1400}%`,
      background: `url(${background})`,
      backgroundSize: 'cover',
    },
  });

export default withStyles(styles)(Hero);
