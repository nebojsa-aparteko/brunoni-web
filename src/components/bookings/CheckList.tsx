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
import { Booking } from '../../model/Booking';

interface Props {
  showCompanyInfo?: boolean;
  booking: Booking | undefined;
}

interface Data {
  key: string;
  value: boolean | string;
  attachment: string | null;
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

const CheckList: React.FC<Props> = ({ showCompanyInfo, booking }) => {
  const classes = useStyles();
  const isRegularUser = !showCompanyInfo;

  const [ data, setData ] = useState<Data[] | undefined>(undefined);

  useEffect(() => {
    const payloadExport: Data[] = [
      {
        key: 'Depot Out',
        value: true,
        attachment: null
      },
      {
        key: 'Gate In Terminal',
        value: true,
        attachment: null
      },
      {
        key: 'VGM Submission',
        value: true,
        attachment: null
      },
      {
        key: 'Shipping Instructions',
        value: true,
        attachment: 'PDF'
      },
      {
        key: 'B/L Draft Received',
        value: true,
        attachment: 'PDF'
      },
      {
        key: 'B/L Draft Approved',
        value: true,
        attachment: 'PDF'
      },
      {
        key: 'Shipped on Board',
        value: 'PENDING',
        attachment: null
      },
      {
        key: 'Final B/L Copy',
        value: 'PENDING',
        attachment: null
      }
    ];

    const payloadImport: Data[] = [
      {
        key: 'Bill of Lading Copy',
        value: true,
        attachment: 'PDF'
      },
      {
        key: 'Release Instructions',
        value: true,
        attachment: 'PDF'
      },
      {
        key: 'Pin Number',
        value: true,
        attachment: 'PDF'
      },
      {
        key: 'Gate out Terminal',
        value: false,
        attachment: null
      },
      {
        key: 'Depot In',
        value: 'PENDING',
        attachment: null
      }
    ];

    if(booking && booking.Category === 'Export') {
      setData(payloadExport);
    }

    if(booking && booking.Category === 'Import') {
      setData(payloadImport);
    }
  }, [booking]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
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
            key={`check-list-row-${index}`}
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
            <TableCell>{item.attachment}</TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
};

export default CheckList;
