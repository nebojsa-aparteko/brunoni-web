import React, { useCallback } from 'react';
import {
  Checkbox,
  createStyles,
  Theme,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  makeStyles
} from '@material-ui/core';
import { CheckListData } from './BookingsTable';
import DropZone from '../DropZone';

interface CheckListProps {
  data: CheckListData[] | undefined;
  showCompanyInfo?: boolean;
  onCheckboxChange: any;
  onFilesDrop: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      marginTop: theme.spacing(3),
      width: '100%',
      overflowX: 'auto',
      marginBottom: theme.spacing(2),
    },
    table: {
      overflowX: 'auto',
      marginBottom: '1.5em',
    },
    tableRow: {
      height: '55px',
      '& td': {
        whiteSpace: 'nowrap',
        padding: '6px 12px',
      },
      ['@media print']: {
        '& td': {
          padding: theme.spacing(0),
        },
      },
    },
    tableWrapper: {
      overflowX: 'auto',
    },
  }),
);

const CheckList: React.FC<CheckListProps> = ({ data, showCompanyInfo, onCheckboxChange, onFilesDrop }) => {
  const classes = useStyles();

  return (
    <Table className={classes.table} size="small" aria-label="a dense table">
      <TableHead>
        <TableRow>
          <TableCell align="center">&nbsp;</TableCell>
          <TableCell>&nbsp;</TableCell>
          <TableCell>Customer</TableCell>
          {showCompanyInfo && <TableCell>Admin</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {data?.map((item: CheckListData, index: number) => {
          return (
            <TableRow
              key={`check-list-row-${index}`}
              selected={(index + 1) % 2 === 0}
              className={classes.tableRow}
            >
              <TableCell align="center">
                {'value' in item ? (
                  <Checkbox
                    checked={item.value}
                    disabled={!showCompanyInfo}
                    onChange={event => onCheckboxChange(event, item.label)}
                  />
                ) : null}
              </TableCell>

              <TableCell>{item.label}</TableCell>

              <TableCell>
                <DropZone
                  onDrop={(files: []) => onFilesDrop(files, item.label, false)}
                  accept="application/pdf"
                  documents={item.documents.filter(document => !document.isAdmin)}
                />
              </TableCell>

              {showCompanyInfo ? (
                <TableCell>
                  <DropZone
                    onDrop={(files: []) => onFilesDrop(files, item.label, true)}
                    accept="application/pdf"
                    documents={item.documents.filter(document => document.isAdmin)}
                  />
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default CheckList;
