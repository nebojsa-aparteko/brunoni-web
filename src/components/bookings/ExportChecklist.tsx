import React, { useEffect, useState } from 'react';
import {
  Checkbox,
  createStyles,
  Theme,
  Table,
  TableCell,
  TableRow,
  makeStyles
} from '@material-ui/core';

interface Props {
  showCompanyInfo?: boolean;
}

interface Data {
  key: string;
  value: boolean | string;
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
    costUnitCell: {
      paddingLeft: 0,
      minWidth: '150px',
    },
    tableRow: {
      height: '55px',
      '& td': {
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
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
    textEmphasized: {
      color: '#3BADE1',
      fontWeight: 'bold'
    }
  }),
);

const ExportChecklist: React.FC<Props> = ({ showCompanyInfo }) => {
  const classes = useStyles();
  const isRegularUser = !showCompanyInfo;

  const [ data, setData ] = useState<Data[] | undefined>(undefined);

  useEffect(() => {
    const payload: Data[] = [
      {
        key: 'Depot Out',
        value: true
      },
      {
        key: 'Gate In Terminal',
        value: true
      },
      {
        key: 'VGM Submission',
        value: true
      },
      {
        key: 'Shipping Instructions',
        value: true
      },
      {
        key: 'B/L Draft Received',
        value: true
      },
      {
        key: 'B/L Draft Approved',
        value: true
      },
      {
        key: 'Shipped on Board',
        value: 'PENDING'
      },
      {
        key: 'Final B/L Copy',
        value: 'PENDING'
      }
    ];

    setData(payload);
  }, []);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
    console.log('handleCheckboxChange');

    const updatedData = data?.map(item => {
      if(item.key === key) {
        item.value = !item.value;
      }

      return item;
    });

    setData(updatedData);
  };

  return (
    <Table className={classes.table} size="small" aria-label="a dense table">
      {data && data.map((item: Data, index: number) => {
        return (
          <TableRow
            key={`export-checklist-row-${index}`}
            selected={index % 2 === 0}
            className={classes.tableRow}
          >
            {typeof item.value === 'boolean' ? (
              <TableCell align="center">
                <Checkbox
                  checked={item.value}
                  onChange={event => handleCheckboxChange(event, item.key)}
                  disabled={isRegularUser}
                />
              </TableCell>
            ) : (
              <TableCell align="center" className={classes.textEmphasized}>
                {item.value}
              </TableCell>
            )}
            <TableCell>{item.key}</TableCell>
            <TableCell>PDF</TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
};

export default ExportChecklist;
