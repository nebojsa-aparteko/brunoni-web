import React, { useContext, Fragment } from 'react';
import formatDate from 'date-fns/format';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  IconButton,
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
import { Quote } from '../providers/QuotesEndpoint';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

interface Props {
  id: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
  },

  currencyCell: {
    width: '30px',
    textAlign: 'right',
  },
}));

const QuoteGroup: React.FC<Props> = ({ id }) => {
  const classes = useStyles();

  const { result } = useContext(QuotesEndpointContext);

  const quoteGroup = result?.find(quoteGroup => quoteGroup.id === id);

  if (!quoteGroup) {
    return null;
  }

  const quotesByCarrier = flow(get('quotes'), groupBy('carrier.id'), toPairs)(quoteGroup) as Array<[string, Quote[]]>;

  console.log('quotesByCarrier', quotesByCarrier);

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Card className={classes.root}>
        <CardHeader
          title={`Quotations - ${quoteGroup?.origin.city}, ${quoteGroup?.origin.country} - ${quoteGroup.destination.city}, ${quoteGroup.destination.country}`}
          subheader={formatDate(quoteGroup.dateIssued, 'd. MMMM yyyy')}
        />
        <CardContent>
          <Box m={2}>
            <Grid container spacing={2}>
              {quoteGroup.containers.map((container, i) => (
                <Grid item>
                  <Chip
                    key={i}
                    label={
                      (container.quantity > 1 ? container.quantity + ' x ' : '') +
                      container!.containerType?.name +
                      ', ' +
                      container?.commodityType?.name
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          {quotesByCarrier.map(([carrierId, quotes]) => (
            <Paper id={carrierId}>
              <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
                <ExpansionPanelSummary aria-controls="panel1c-content" expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h4" gutterBottom>
                    {carrierId}
                  </Typography>
                </ExpansionPanelSummary>

                <ExpansionPanelDetails>
                  <Table size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        {quotes.map(quote => (
                          <Fragment>
                            <TableCell className={classes.currencyCell}>Currency</TableCell>
                            <TableCell key={quote.id}>
                              {formatDate(quote.validityPeriod.from, 'd. MMMM')} –{' '}
                              {formatDate(quote.validityPeriod.to, 'd. MMMM')}
                            </TableCell>
                          </Fragment>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {quotes[0].quoteDetails.map((quoteDetail, i) => (
                        <TableRow key={i}>
                          <TableCell component="th" scope="row">
                            {quoteDetail.Description}
                          </TableCell>
                          {quotes.map((quote: any) => (
                            <Fragment>
                              <TableCell className={classes.currencyCell}>
                                {quoteDetail.Currency !== 'incl.' ? quoteDetail.Currency : ''}
                              </TableCell>
                              <TableCell key={quote.QuoteNumber}>
                                {quoteDetail.Currency === 'incl.' ? quoteDetail.Currency : ''} {quoteDetail.CostValue}{' '}
                                {quoteDetail.CostUnit}
                              </TableCell>
                            </Fragment>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell />

                        {quotes.map(quote => (
                          <Fragment>
                            <TableCell />
                            <TableCell key={quote.id}>
                              <Button color="primary" component={RouterLink} size="small" to={`/quotes/${quote.id}`}>
                                View more
                              </Button>
                              <Button
                                color="primary"
                                variant="contained"
                                component={RouterLink}
                                size="small"
                                to={`/quotes/${quote.id}`}
                              >
                                Request Booking
                              </Button>
                            </TableCell>
                          </Fragment>
                        ))}
                      </TableRow>
                    </TableFooter>
                  </Table>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </Paper>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
};

export default QuoteGroup;
