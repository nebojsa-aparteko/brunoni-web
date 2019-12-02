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
  ListItemText,
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
import map from 'lodash/fp/map';
import merge from 'lodash/fp/merge';
import flatten from 'lodash/fp/flatten';
import uniqBy from 'lodash/fp/uniqBy';
import uniqWith from 'lodash/fp/uniqWith';
import values from 'lodash/fp/values';
import QuotesEndpointContext from '../contexts/QuotesEndpoint';
import { Link as RouterLink } from 'react-router-dom';
import { Quote, QuoteDetail } from '../providers/QuotesEndpoint';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import quoteDetailFilterList from '../utilities/quoteDetailFilterList';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import logAs from '../utilities/logAs';
import { Action } from 'material-table';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import { buildMailToLink } from './quotes/QuoteBookingBodyTextSharePrep';
import useUser from '../hooks/useUser';

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
  title: {
    fontSize: '1.2em',
  },
  buttonContainer: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    border: 'none',
  },
  noBorder: {
    border: 'none',
  },
  costUnitCell: {
    paddingLeft: 0,
    minWidth: '150px',
  },
}));

interface ActionButtonsProps {
  quote: Quote;
}

const QuoteItemActionButtons: React.FC<ActionButtonsProps> = ({ quote }) => {
  const [moreAnchorEl, setMoreAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const [user, userData] = useUser();

  const onMoreButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMoreAnchorEl(null);
  };

  return (
    <Fragment>
      <Button color="primary" variant="outlined" component={RouterLink} size="small" to={`/quotes/${quote.id}`}>
        View more
      </Button>
      <Button
        color="primary"
        variant="contained"
        size="small"
        style={{ marginLeft: '4px' }}
        href={buildMailToLink(quote, [user, userData])}
        target="_blank"
      >
        Book Now
      </Button>
      <IconButton aria-label="actions" onClick={onMoreButtonClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu id="actions" anchorEl={moreAnchorEl} keepMounted open={Boolean(moreAnchorEl)} onClose={handleClose}>
        <MenuItem
          component="a"
          href={`mailto:platform@mybrunoni.ch?subject=Quote: ${quote.id} - Feedback`}
          target="_blank"
        >
          <ListItemIcon>
            <DirectionsBoatIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Feedback" />
        </MenuItem>
      </Menu>
    </Fragment>
  );
};

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
          classes={{ title: classes.title }}
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
                <Grid item key={i}>
                  <Chip
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
            // need to find all of the quoteDetail items across provided quotes
            const quoteDetailItemsMerged = flow(
              map(get('quoteDetails')),
              flatten,
              uniqWith(
                (arrVal: QuoteDetail, othVal: QuoteDetail) =>
                  arrVal.Description === othVal.Description &&
                  arrVal.CostUnit === othVal.CostUnit &&
                  arrVal.Currency === othVal.Currency,
              ),
            )(quotes) as QuoteDetail[];
            return (
              <Paper id={carrierId}>
                <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
                  <ExpansionPanelSummary aria-controls="panel1c-content" expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h4">{carrierId}</Typography>
                  </ExpansionPanelSummary>

                  <ExpansionPanelDetails className={classes.tableScroll}>
                    <Container>
                      <Table size="small" aria-label="a dense table">
                        <TableHead>
                          <TableRow>
                            <TableCell />
                            {quotes.map((quote, index) => (
                              <Fragment key={index}>
                                <TableCell className={classes.currencyCell}>Currency</TableCell>
                                <TableCell align="right">Cost Value</TableCell>
                                <TableCell>Cost Unit</TableCell>
                              </Fragment>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {quoteDetailItemsMerged
                            .filter(quoteDetail =>
                              quoteDetailFilterList.includes(quoteDetail.Description.toLowerCase()),
                            )
                            .map((quoteDetail, i) => (
                              <TableRow key={i}>
                                <TableCell component="th" scope="row">
                                  {quoteDetail.Description}
                                </TableCell>
                                {quotes.map((quote: any) => {
                                  const matchingQuoteDetail = quote.quoteDetails.filter(
                                    (item: QuoteDetail) =>
                                      quoteDetail.Description === item.Description &&
                                      quoteDetail.CostUnit === item.CostUnit &&
                                      quoteDetail.Currency === item.Currency,
                                  );

                                  if (matchingQuoteDetail.length == 0) {
                                    return <TableCell colSpan={3} />;
                                  } else {
                                    return matchingQuoteDetail.map((quoteDetailInstance: QuoteDetail, i: number) => (
                                      <Fragment key={i}>
                                        <TableCell className={classes.currencyCell}>
                                          {quoteDetailInstance.Currency !== 'incl.' ? quoteDetailInstance.Currency : ''}
                                        </TableCell>
                                        <TableCell align="right">{quoteDetailInstance.CostValue}</TableCell>
                                        <TableCell>
                                          {quoteDetailInstance.Currency === 'incl.' ? quoteDetailInstance.Currency : ''}{' '}
                                          {quoteDetailInstance.CostUnit}
                                        </TableCell>
                                      </Fragment>
                                    ));
                                  }
                                })}
                              </TableRow>
                            ))}

                          <TableRow>
                            <TableCell component="th" scope="row">
                              Service Details
                            </TableCell>
                            {quotes.map((quote: any) => (
                              <Fragment>
                                <TableCell key={quote.QuoteNumber} colSpan={3} align="center">
                                  {quote.serviceDetails[0].Frequency} {quote.serviceDetails[0].Routing}{' '}
                                  {quote.serviceDetails[0].TransitTime} days
                                </TableCell>
                              </Fragment>
                            ))}
                          </TableRow>

                          <TableRow>
                            <TableCell component="th" scope="row">
                              Quote Validity
                            </TableCell>
                            {quotes.map((quote, index) => (
                              <Fragment key={index}>
                                <TableCell colSpan={3} align="center">
                                  {formatDate(quote.validityPeriod.from, 'd. MMMM')} –{' '}
                                  {formatDate(quote.validityPeriod.to, 'd. MMMM')}
                                </TableCell>
                              </Fragment>
                            ))}
                          </TableRow>
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell className={classes.noBorder} />

                            {quotes.map(quote => (
                              <Fragment key={quote.id}>
                                <TableCell className={classes.noBorder} />
                                <TableCell className={classes.buttonContainer} colSpan={2}>
                                  <QuoteItemActionButtons quote={quote} />
                                </TableCell>
                              </Fragment>
                            ))}
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </Container>
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
