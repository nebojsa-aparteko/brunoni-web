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
  onAutoRematch: (selectedRows: Array<{ entity: string; entityId: string }>) => void;
  selectedRows: Array<{ entity: string; entityId: string }>;
}

export const ManualMatchingTableToolbar: React.FC<ManualMatchingTableToolbarProps> = ({
  numSelected,
  onDiscard,
  onAutoRematch,
  selectedRows,
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
        <>
          {numSelected > 100 ? (
            <Typography color="error" variant="body2" style={{ flexShrink: 0, marginRight: 8 }}>
              Too many entities selected, maximum allowed is 100
            </Typography>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                console.debug('Auto Rematch selected rows:', selectedRows);
                onAutoRematch(selectedRows);
              }}
              style={{ flexShrink: 0, marginRight: 8 }}
            >
              Auto Rematch
            </Button>
          )}
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={onDiscard}
            style={{ flexShrink: 0 }}
          >
            Discard
          </Button>
        </>
      )}
    </Toolbar>
  );
};
