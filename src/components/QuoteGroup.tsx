import React, { Fragment, useContext } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Theme,
  Typography,
} from '@material-ui/core';
import flow from 'lodash/fp/flow';
import groupBy from 'lodash/fp/groupBy';
import toPairs from 'lodash/fp/toPairs';
import get from 'lodash/fp/get';
import QuotesEndpointContext from '../contexts/QuotesEndpoint';
import { Link as RouterLink } from 'react-router-dom';
import { QuoteDetailQuoteDetail, QuoteHeader } from '../model/quotes/QuotesResult';

interface Props {
  id: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
  },
}));

const QuoteGroup: React.FC<Props> = ({ id }) => {
  const classes = useStyles();

  const { result } = useContext(QuotesEndpointContext);

  const quoteGroup = result?.find(quoteGroup => quoteGroup.id === id);

  if (!quoteGroup) {
    return null;
  }

  const quotesByCarrier = flow(get('quotes'), groupBy('CarrierID'), toPairs)(quoteGroup) as Array<
    [string, Array<QuoteHeader>]
  >;

  console.log('quotesByCarrier', quotesByCarrier);

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Box>{quoteGroup.date.toString()}</Box>
      <Box>{quoteGroup.origin.id}</Box>
      <Box>{quoteGroup.destination.id}</Box>
      <Grid container spacing={2}>
        {quoteGroup.containers.map((container, i) => (
          <Grid item key={i} xs={2}>
            <Paper>
              <Box p={1}>
                <Box>{container?.containerType?.displayId || container?.containerType?.id || '?'}</Box>
                <Box>{container?.commodityType?.name || container?.commodityType?.id || '?'}</Box>
                <Box>{container?.quantity || '?'}</Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {quotesByCarrier.map(([carrierId, quotes]) => (
        <Paper id={carrierId}>
          <Typography variant="h4" gutterBottom>
            {carrierId}
          </Typography>
          <Table size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell />
                {quotes.map((quote: any) => (
                  <TableCell key={quote.QuoteNumber}>{quote.QuoteValidity}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {((quotes[0].QuoteDetails as unknown) as QuoteDetailQuoteDetail[]).map((quoteDetail, i) => {
                return (
                  <TableRow key={i}>
                    <TableCell component="th" scope="row">
                      {quoteDetail.Description}
                    </TableCell>
                    {quotes.map((quote: any) => (
                      <TableCell key={quote.QuoteNumber}>
                        <Typography>
                          {quoteDetail.CostValue} {quoteDetail.Currency} {quoteDetail.CostUnit}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell />
                {quotes.map((quote: any) => (
                  <TableCell key={quote.QuoteNumber}>
                    <Button color="primary" component={RouterLink} size="small" to={`/quotes/${quote.QuoteNumber}`}>
                      View more
                    </Button>
                    <Button
                      color="primary"
                      variant="contained"
                      component={RouterLink}
                      size="small"
                      to={`/quotes/${quote.QuoteNumber}`}
                    >
                      Request Booking
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          </Table>
        </Paper>
      ))}
    </Container>
  );
};

export default QuoteGroup;
