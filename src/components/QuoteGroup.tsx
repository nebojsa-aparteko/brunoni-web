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
import { Quote, QuoteDetail } from '../providers/QuotesEndpoint';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import quoteDetailFilterList from '../utilities/quoteDetailFilterList';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

interface Props {
  id: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
  },

  currencyCell: {
    width: '30px',
    textAlign: 'right',
  },
  tableScroll: {
    overflowX: 'auto',
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
    <Container maxWidth="lg">
      <Card className={classes.root}>
        <CardHeader
          avatar={
            <IconButton
              aria-label="back button"
              color="primary"
              component={RouterLink}
              size="small"
              to={`/quotes/groups`}
            >
              <ArrowBackIcon />
            </IconButton>
          }
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
                      container!.containerType?.description +
                      ', ' +
                      container?.commodityType?.name
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          {quotesByCarrier.map(([carrierId, quotes]) => {
            return (
              <Paper id={carrierId}>
                <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
                  <ExpansionPanelSummary aria-controls="panel1c-content" expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h4" gutterBottom>
                      {carrierId}
                    </Typography>
                  </ExpansionPanelSummary>

                  <ExpansionPanelDetails className={classes.tableScroll}>
                    <Table size="small" aria-label="a dense table">
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          {quotes.map(quote => (
                            <Fragment>
                              <TableCell className={classes.currencyCell}>Currency</TableCell>
                              <TableCell key={quote.id} style={{ minWidth: '282px' }}>
                                {formatDate(quote.validityPeriod.from, 'd. MMMM')} –{' '}
                                {formatDate(quote.validityPeriod.to, 'd. MMMM')}
                              </TableCell>
                            </Fragment>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {quotes[0].quoteDetails
                          .filter(quoteDetail => quoteDetailFilterList.includes(quoteDetail.Description))
                          .map((quoteDetail, i) => (
                            <TableRow key={i}>
                              <TableCell component="th" scope="row">
                                {quoteDetail.Description}
                              </TableCell>
                              {quotes.map((quote: any) => {
                                return quote.quoteDetails
                                  .filter(
                                    (item: QuoteDetail) =>
                                      quoteDetail.Description === item.Description &&
                                      quoteDetail.CostUnit === item.CostUnit,
                                  )
                                  .map((quoteDetailInstance: QuoteDetail, i: number) => (
                                    <Fragment key={i}>
                                      <TableCell className={classes.currencyCell}>
                                        {quoteDetailInstance.Currency !== 'incl.' ? quoteDetailInstance.Currency : ''}
                                      </TableCell>
                                      <TableCell>
                                        {quoteDetailInstance.Currency === 'incl.' ? quoteDetailInstance.Currency : ''}{' '}
                                        {quoteDetailInstance.CostValue} {quoteDetailInstance.CostUnit}
                                      </TableCell>
                                    </Fragment>
                                  ));
                              })}
                            </TableRow>
                          ))}
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Service Details
                          </TableCell>
                          {quotes.map((quote: any) => (
                            <Fragment>
                              <TableCell className={classes.currencyCell} />
                              <TableCell key={quote.QuoteNumber}>
                                {quote.serviceDetails[0].Frequency} {quote.serviceDetails[0].Routing}{' '}
                                {quote.serviceDetails[0].TransitTime} days
                              </TableCell>
                            </Fragment>
                          ))}
                        </TableRow>
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell />

                          {quotes.map(quote => (
                            <Fragment>
                              <TableCell />
                              <TableCell key={quote.id}>
                                <Button
                                  color="primary"
                                  variant="outlined"
                                  component={RouterLink}
                                  size="small"
                                  to={`/quotes/${quote.id}`}
                                >
                                  View more
                                </Button>
                                <Button
                                  color="primary"
                                  variant="contained"
                                  component={RouterLink}
                                  size="small"
                                  to={`/quotes/${quote.id}`}
                                  style={{ marginLeft: '4px' }}
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
            );
          })}
        </CardContent>
      </Card>
    </Container>
  );
};

export default QuoteGroup;
