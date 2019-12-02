import React, { Fragment } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import { QuoteDetail } from '../../providers/QuotesEndpoint';

interface Props {
  quoteDetails: QuoteDetail[];
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
      minWidth: 650,
    },
    tableHead: {
      fontWeight: theme.typography.fontWeightBold,
    },
  }),
);

const QuoteItemQuoteDetails: React.FC<Props> = ({ quoteDetails }) => {
  const classes = useStyles();

  return (
    <Fragment>
      <Grid item xs={12}>
        <Table aria-label="simple table" className={classes.table} size="small">
          <TableHead className={classes.tableHead}>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Cost Value</TableCell>
              <TableCell>Cost Unit</TableCell>
              <TableCell>Remark</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quoteDetails.map((quoteDetail, index) => (
              <TableRow key={quoteDetail.Pos} selected={index % 2 === 0}>
                <TableCell component="th" scope="row">
                  {quoteDetail.Description}
                </TableCell>
                <TableCell align="right">{quoteDetail.Currency}</TableCell>
                <TableCell>{quoteDetail.CostValue}</TableCell>
                <TableCell>{quoteDetail.CostUnit}</TableCell>
                <TableCell>
                  {quoteDetail.RemarkRef || ''}
                  {quoteDetail.Remark}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Fragment>
  );
};

export default QuoteItemQuoteDetails;
