import React, { Fragment } from 'react';
import Linkify from 'react-linkify';
import { Theme, makeStyles } from '@material-ui/core/styles';
import { Grid, Link } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import { QuoteDetail } from '../../providers/QuoteGroupsProvider';
import Box from '@material-ui/core/Box';

interface Props {
  quoteDetails: QuoteDetail[];
}

const useStyles = makeStyles((theme: Theme) => ({
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
    overflowX: 'auto',
  },
  tableHead: {
    fontWeight: theme.typography.fontWeightBold,
  },
  costUnitCell: {
    paddingLeft: 0,
    minWidth: '150px',
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
  },
  tableWrapper: {
    overflowX: 'auto',
  },
}));

const QuoteItemQuoteDetails: React.FC<Props> = ({ quoteDetails }) => {
  const classes = useStyles();

  return (
    <Fragment>
      <Grid item xs={12}>
        <Box className={classes.tableWrapper}>
          <Table className={classes.table} size="small">
            <TableHead className={classes.tableHead}>
              <TableRow className={classes.tableRow}>
                <TableCell>Description</TableCell>
                <TableCell align="right">Currency</TableCell>
                <TableCell align="right">Cost Value</TableCell>
                <TableCell>Cost Unit</TableCell>
                <TableCell>Remark</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quoteDetails.map((quoteDetail, index) => (
                <TableRow key={quoteDetail.Pos} selected={(index + 1) % 2 === 0} className={classes.tableRow}>
                  <TableCell component="th" scope="row">
                    {quoteDetail.Description}
                  </TableCell>
                  <TableCell align="right">{quoteDetail.Currency}</TableCell>
                  <TableCell align="right">{quoteDetail.CostValue}</TableCell>
                  <TableCell>{quoteDetail.CostUnit}</TableCell>
                  <TableCell>
                    <Linkify
                      componentDecorator={(decoratedHref: string, decoratedText: string, key: number) => (
                        <Link key={key} href={decoratedHref}>
                          {decoratedText}
                        </Link>
                      )}
                    >
                      {quoteDetail.RemarkRef || ''}
                      {quoteDetail.Remark}
                    </Linkify>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Grid>
    </Fragment>
  );
};

export default QuoteItemQuoteDetails;
