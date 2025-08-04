import React from 'react';
import { Button, Toolbar, Typography, makeStyles, Theme } from '@material-ui/core';
import { lighten } from '@material-ui/core/styles';
import palette from '../../theme/palette';

const useStyles = makeStyles((theme: Theme) => ({
  toolbarRoot: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    backgroundColor: palette.background.hover,
  },
  toolbarHighlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.error.main,
          backgroundColor: lighten(theme.palette.error.light, 0.85),
        }
      : {
          color: theme.palette.error.dark,
          backgroundColor: theme.palette.error.dark,
        },
  toolbarTitle: {
    flex: '1 1 100%',
  },
}));

interface ManualMatchingTableToolbarProps {
  numSelected: number;
  onDiscard: () => void;
}

export const ManualMatchingTableToolbar: React.FC<ManualMatchingTableToolbarProps> = ({
  numSelected,
  onDiscard,
}) => {
  const classes = useStyles();

  return (
    <Toolbar
      className={`${classes.toolbarRoot} ${numSelected > 0 ? classes.toolbarHighlight : ''}`}
    >
      {numSelected > 0 ? (
        <Typography
          className={classes.toolbarTitle}
          color="error"
          variant="subtitle1"
          component="div"
        >
          {numSelected === 1 ? `${numSelected} match selected` : `${numSelected} matches selected`}
        </Typography>
      ) : (
        <Typography className={classes.toolbarTitle} variant="h4" component="div">
          Manual Matching
        </Typography>
      )}
      {numSelected > 0 && (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={onDiscard}
          style={{ flexShrink: 0 }}
        >
          Discard
        </Button>
      )}
    </Toolbar>
  );
};
