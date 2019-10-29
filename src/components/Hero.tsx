import React from 'react';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';

interface Props extends WithStyles<typeof styles> {}

const Hero: React.FC<Props> = ({ classes }) => <div className={classes.container} />;

const styles = (theme: Theme) =>
  createStyles({
    container: {
      height: 0,
      padding: `${200 / 14}%`,
      background: `url(${require(`../assets/hero.${process.env.REACT_APP_BRAND}.jpg`)})`,
      backgroundSize: 'cover',
    },
  });

export default withStyles(styles)(Hero);
