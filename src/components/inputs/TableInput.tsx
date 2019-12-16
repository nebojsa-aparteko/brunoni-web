import React, { ChangeEvent } from 'react';
import classNames from 'classnames';
import {
  Theme,
  makeStyles,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  InputBase,
  Tooltip,
  Box,
} from '@material-ui/core';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import set from 'lodash/fp/set';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import InputProps from '../../model/InputProps';

interface TableInputValue {
  columns: Array<string>;
  rows: Array<{ values: string[] }>;
}

interface Props extends InputProps<TableInputValue> {}

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    borderTop: `1px solid ${theme.palette.grey[200]}`,
    borderRight: `1px solid ${theme.palette.grey[200]}`,
  },
  tableCell: {
    padding: 0,
    borderLeft: `1px solid ${theme.palette.grey[200]}`,
  },
  lastTableCell: {
    width: theme.spacing(8),
  },
  inputBase: {
    padding: theme.spacing(2),
  },
  button: {
    margin: theme.spacing(1),
  },
}));

function removeAt(index: number) {
  return function remove<T>(array: T[]) {
    const next = [...array];
    next.splice(index, 1);
    return next;
  };
}

const TableInput: React.FC<Props> = ({ value, onChange }) => {
  const classes = useStyles();

  const { columns, rows } = value;

  const handleAddColumn = () =>
    onChange(
      flow(
        update('columns', columns => columns.concat('')),
        update('rows', map(update('values', values => values.concat('')))),
      )(value),
    );

  const handleRemoveRow = (i: number) => () => onChange(update('rows', removeAt(i))(value));

  const handleRemoveColumn = (j: number) => () =>
    onChange(flow(update('columns', removeAt(j)), update('rows', map(update('values', removeAt(j)))))(value));

  const handleAddRow = () =>
    onChange(update('rows', rows => rows.concat([{ values: [...Array(value.columns.length)].map(_ => '') }]))(value));

  const handleUpdateColumn = (j: number) => (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set(['columns', j], e.target.value)(value));

  const handleUpdateRow = (i: number, j: number) => (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set(['rows', i, 'values', j], e.target.value)(value));

  return (
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          {columns.map((column, j) => (
            <TableCell key={j} className={classes.tableCell}>
              <Box display="flex">
                <InputBase
                  fullWidth
                  className={classes.inputBase}
                  value={column || ''}
                  onChange={handleUpdateColumn(j)}
                />
                <Tooltip title="Remove column">
                  <IconButton aria-label="Remove column" onClick={handleRemoveColumn(j)} className={classes.button}>
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
          ))}
          <TableCell className={classNames(classes.tableCell, classes.lastTableCell)}>
            <Tooltip title="Add column">
              <IconButton aria-label="Add column" onClick={handleAddColumn} className={classes.button}>
                <ArrowForwardIcon />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {columns.map((column, j) => (
              <TableCell key={j} className={classes.tableCell}>
                <InputBase
                  fullWidth
                  className={classes.inputBase}
                  value={row.values[j] || ''}
                  onChange={handleUpdateRow(i, j)}
                />
              </TableCell>
            ))}
            <TableCell className={classNames(classes.tableCell, classes.lastTableCell)}>
              <Tooltip title="Remove row">
                <IconButton aria-label="Remove row" onClick={handleRemoveRow(i)} className={classes.button}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell colSpan={columns.length + 1} className={classes.tableCell}>
            <Tooltip title="Add row">
              <IconButton aria-label="Add row" onClick={handleAddRow} className={classes.button}>
                <ArrowDownwardIcon />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default TableInput;
