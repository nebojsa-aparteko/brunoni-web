import { Button, createStyles, IconButton, Toolbar, Tooltip, Typography } from '@material-ui/core';
import clsx from 'clsx';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import React from 'react';
import { lighten, makeStyles, Theme } from '@material-ui/core/styles';
import palette from '../theme/palette';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
  }),
);

interface EnhancedTableToolbarProps {
  numSelected: number;
  handleAdd: () => void;
  handleDelete: () => void;
  labelWhenSelected: string;
  labelWhenNotSelected: string;
  addButtonLabel: string;
  deleteButtonLabel: string;
}

export const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const classes = useStyles();
  const {
    numSelected,
    handleAdd,
    handleDelete,
    labelWhenSelected,
    labelWhenNotSelected,
    addButtonLabel,
    deleteButtonLabel,
  } = props;

  return (
    <Toolbar
      className={clsx(classes.toolbarRoot, {
        [classes.toolbarHighlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.toolbarTitle} color="error" variant="subtitle1" component="div">
          {labelWhenSelected}
        </Typography>
      ) : (
        <Typography className={classes.toolbarTitle} variant="h4" id="tableTitle" component="div">
          {labelWhenNotSelected}
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title={deleteButtonLabel}>
          <IconButton aria-label="delete" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          aria-label="filter list"
          onClick={handleAdd}
          style={{ flexShrink: 0 }}
        >
          {addButtonLabel || 'Add'}
        </Button>
      )}
    </Toolbar>
  );
};
