import { QuoteDetail } from '../../providers/QuoteGroupsProvider';
import { makeStyles, Theme } from '@material-ui/core/styles';
import React, { Fragment, useCallback, useContext, useState } from 'react';
import { Checkbox, Grid, TextField } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import { BookingRequest } from '../../model/BookingRequest';
import ChargeCodeInput from '../inputs/ChargeCodeInput';
import { set } from 'lodash/fp';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import { EnhancedTableToolbar } from '../EnhancedTableToolbar';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import ChargeCodes from '../../contexts/ChargeCodes';

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    minWidth: 650,
    overflowX: 'auto',
  },
  tableHead: {
    fontWeight: theme.typography.fontWeightBold,
  },
  tableRow: {
    '& td': {
      whiteSpace: 'nowrap',
    },
    ['@media print']: {
      '& td': {
        padding: theme.spacing(0),
      },
    },
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.default,
    },
  },
  tableWrapper: {
    overflowX: 'auto',
  },
}));

interface RowProps {
  quoteDetail: QuoteDetail;
  index: number;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
}

const getUpdatedFreightDetails = (
  bookingRequest: BookingRequest,
  value: any | undefined,
  index: number,
  field: string,
) => {
  return (
    bookingRequest.freightDetails &&
    bookingRequest.freightDetails.map((detail: QuoteDetail, detailIndex: number) =>
      detailIndex === index ? set(field, value)(detail) : detail,
    )
  );
};

const BookingRequestFreightDetailsRow: React.FC<RowProps> = ({ quoteDetail, index, selected, onSelectRow }) => {
  const classes = useStyles();
  const [bookingRequest, setBookingRequest, editing] = useBookingRequestContext();

  const handleChangeFreightDetails = (value: string | undefined, fieldName: string) => {
    bookingRequest &&
      setBookingRequest &&
      setBookingRequest(
        set(
          'freightDetails',
          getUpdatedFreightDetails(bookingRequest, value, index, fieldName),
        )(bookingRequest) as BookingRequest,
      );
  };

  return (
    <TableRow key={quoteDetail.Pos} className={classes.tableRow}>
      {editing && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={event => onSelectRow(event)}
            onFocus={event => event.stopPropagation()}
            color="primary"
          />
        </TableCell>
      )}
      <TableCell component="th" scope="row">
        {editing ? (
          <ChargeCodeInput
            chargeCodeText={quoteDetail.Description}
            handleChange={code => handleChangeFreightDetails(code?.text, 'Description')}
            margin="dense"
          />
        ) : (
          quoteDetail.Description
        )}
      </TableCell>
      <TableCell align="right">
        {editing ? (
          <TextField
            label=""
            margin="dense"
            variant="outlined"
            fullWidth
            value={quoteDetail.Currency}
            onChange={event => handleChangeFreightDetails(event.target.value, 'Currency')}
          />
        ) : (
          quoteDetail.Currency
        )}
      </TableCell>
      <TableCell align="right">
        {editing ? (
          <TextField
            label=""
            margin="dense"
            variant="outlined"
            fullWidth
            value={quoteDetail.CostValue}
            onChange={event => handleChangeFreightDetails(event.target.value, 'CostValue')}
          />
        ) : (
          quoteDetail.CostValue
        )}
      </TableCell>
      <TableCell>
        {editing ? (
          <TextField
            label=""
            margin="dense"
            variant="outlined"
            fullWidth
            value={quoteDetail.CostUnit}
            onChange={event => handleChangeFreightDetails(event.target.value, 'CostUnit')}
          />
        ) : (
          quoteDetail.CostUnit
        )}
      </TableCell>
    </TableRow>
  );
};

const findNextPos = (quoteDetails: QuoteDetail[]) => {
  //TODO probably needs to be edited because of concurrency
  let pos = 0;
  for (let i in quoteDetails) {
    const value = parseInt(quoteDetails[i].Pos);
    if (value >= pos) pos = value + 1;
  }
  return pos + '';
};

const BookingRequestFreightDetails: React.FC<Props> = ({ quoteDetails }) => {
  const classes = useStyles();
  const chargeCodes = useContext(ChargeCodes);
  const [bookingRequest, setBookingRequest, editing] = useBookingRequestContext();
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);

  const handleSelectDeselectAll = () => {
    if (selectedDetails.length !== quoteDetails.length) {
      setSelectedDetails(quoteDetails.map(detail => detail.Pos));
    } else {
      setSelectedDetails([]);
    }
  };

  const onSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      event.stopPropagation();
      setSelectedDetails(prevState =>
        selectedDetails.includes(id) ? [...prevState.filter(d => d !== id)] : [...prevState, id],
      );
    },
    [selectedDetails],
  );

  const onAdd = () => {
    bookingRequest &&
      setBookingRequest &&
      setBookingRequest(
        set(
          'freightDetails',
          quoteDetails.concat({
            Pos: findNextPos(quoteDetails),
            Description: (chargeCodes && chargeCodes[0].text) || '',
            Currency: 'USD',
            CostValue: '0.00',
            CostUnit: '',
          } as QuoteDetail),
        )(bookingRequest) as BookingRequest,
      );
  };

  const onDelete = () => {
    bookingRequest &&
      setBookingRequest &&
      setBookingRequest(
        set(
          'freightDetails',
          quoteDetails.filter(detail => !selectedDetails.includes(detail.Pos)),
        )(bookingRequest) as BookingRequest,
      );
    setSelectedDetails([]);
  };

  return (
    <Fragment>
      <Grid item xs={12}>
        <TableContainer component={Paper} className={classes.tableWrapper}>
          {editing && (
            <EnhancedTableToolbar
              numSelected={selectedDetails.length}
              handleAdd={onAdd}
              handleDelete={onDelete}
              labelWhenSelected={
                selectedDetails.length === 1
                  ? `${selectedDetails.length} details selected`
                  : `${selectedDetails.length} details selected`
              }
              labelWhenNotSelected={''}
              addTooltip={'Add new detail'}
              deleteTooltip={selectedDetails.length === 1 ? 'Delete detail' : 'Delete details'}
            />
          )}
          <Table className={classes.table} size="small">
            <TableHead className={classes.tableHead}>
              <TableRow className={classes.tableRow}>
                {editing && (
                  <TableCell align="left" style={{ paddingLeft: 4 }}>
                    <Checkbox
                      checked={selectedDetails.length === quoteDetails.length}
                      onClick={handleSelectDeselectAll}
                      onFocus={event => event.stopPropagation()}
                      color="primary"
                    />
                  </TableCell>
                )}
                <TableCell>Description</TableCell>
                <TableCell align={editing ? 'left' : 'right'}>Currency</TableCell>
                <TableCell align={editing ? 'left' : 'right'}>Cost Value</TableCell>
                <TableCell align="left">Cost Unit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quoteDetails.map((quoteDetail, index) => (
                <BookingRequestFreightDetailsRow
                  quoteDetail={quoteDetail}
                  index={index}
                  selected={quoteDetail.Pos ? selectedDetails.includes(quoteDetail.Pos) : false}
                  onSelectRow={event => onSelectRow(event, quoteDetail.Pos)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Fragment>
  );
};

interface Props {
  quoteDetails: QuoteDetail[];
}

export default BookingRequestFreightDetails;
