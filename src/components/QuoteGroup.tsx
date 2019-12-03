import React, { useContext, Fragment, useState } from 'react';
import formatDate from 'date-fns/format';
import {
  Box,
  Button,
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
import orderBy from 'lodash/fp/orderBy';
import toPairs from 'lodash/fp/toPairs';
import padStart from 'lodash/fp/padStart';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import uniqWith from 'lodash/fp/uniqWith';
import QuotesEndpointContext from '../contexts/QuotesEndpoint';
import { Link as RouterLink } from 'react-router-dom';
import { Quote, QuoteDetail } from '../providers/QuotesEndpoint';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import quoteDetailFilterList from '../utilities/quoteDetailFilterList';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { buildMailToLink, buildSpecialRequestLink } from './quotes/QuoteBookingBodyTextSharePrep';
import useUser from '../hooks/useUser';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import FlareIcon from '@material-ui/icons/Flare';
import Helmet from 'react-helmet';

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
  },
  buttons: {
    '& > * + *': {
      marginLeft: theme.spacing(1),
    },
  },
  tableHead: {
    '& th': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  tableRow: {
    '& td, th': {
      whiteSpace: 'nowrap',
    },
    '& td': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  alternateCell: {
    backgroundColor: '#f1f6f8', // TODO figure out why theme overrides from ./theme
    // are in collision with the default Material UI theme.
  },
}));

interface ActionButtonsProps {
  quote: Quote;
}

const QuoteItemActionButtons: React.FC<ActionButtonsProps> = ({ quote }) => {
  const classes = useStyles();
  const [moreAnchorEl, setMoreAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const [user, userData] = useUser();

  const onMoreButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMoreAnchorEl(null);
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" className={classes.buttons}>
      <Button color="primary" variant="outlined" component={RouterLink} size="small" to={`/quotes/${quote.id}`}>
        View more
      </Button>
      <Button
        color="primary"
        variant="contained"
        size="small"
        href={buildMailToLink(quote, [user, userData])}
        target="_blank"
      >
        Book Now
      </Button>
      <IconButton aria-label="actions" onClick={onMoreButtonClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu id="actions" anchorEl={moreAnchorEl} keepMounted open={Boolean(moreAnchorEl)} onClose={handleClose}>
        <MenuItem component="a" href={buildSpecialRequestLink(quote, [user, userData])} target="_blank">
          <ListItemIcon>
            <FlareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="SPECIAL REQUEST?" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

const QuoteGroup: React.FC<Props> = ({ id }) => {
  const classes = useStyles();

  const { result } = useContext(QuotesEndpointContext);

  const [selectedPanel, setSelectedPanel] = useState('');

  const quoteGroup = result?.find(quoteGroup => quoteGroup.id === id);

  if (!quoteGroup) {
    return (
      <Container maxWidth="lg">
        <ChartsCircularProgress />
      </Container>
    );
  }

  const quotesByCarrier = flow(get('quotes'), groupBy('carrier.id'), toPairs)(quoteGroup) as Array<[string, Quote[]]>;

  console.log('quotesByCarrier', quotesByCarrier);

  return !quotesByCarrier ? (
    <Container maxWidth="lg">
      <ChartsCircularProgress />
    </Container>
  ) : (
    <Fragment>
      <Helmet>
        <title>{`${quoteGroup?.origin.city} - ${quoteGroup.destination.city} | ${
          process.env.REACT_APP_BRAND ? process.env.REACT_APP_BRAND.toUpperCase() : ''
        }`}</title>
      </Helmet>
      <Container maxWidth="lg">
        <Box display="flex" mt={6}>
          <Box flexShrink="0">
            <IconButton aria-label="back button" color="primary" component={RouterLink} to={`/quotes/groups`}>
              <ArrowBackIcon />
            </IconButton>
          </Box>

          <Box ml={2} display="flex" flexDirection="column" justifyContent="center">
            <Typography variant="h5">{`Quotations - ${quoteGroup?.origin.city}, ${quoteGroup?.origin.country} - ${quoteGroup.destination.city}, ${quoteGroup.destination.country}`}</Typography>
            <Typography variant="subtitle2">{`${formatDate(quoteGroup.dateIssued, 'd. MMMM yyyy')}`}</Typography>
          </Box>
        </Box>

        <Box mx={2} mt={2} mb={6}>
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
        <Box mb={6}>
          {quotesByCarrier.map(([carrierId, quotes], index) => {
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
              orderBy(flow(get('Pos'), padStart(3)), 'asc'),
            )(quotes) as QuoteDetail[];

            const handlePanelClick = (carrierID: string) => {
              if (selectedPanel === carrierID) {
                setSelectedPanel('');
              } else {
                setSelectedPanel(carrierId);
                window.scrollTo(0, 150);
              }
            };

            return (
              <Box id={carrierId} mb={1} key={index}>
                <ExpansionPanel TransitionProps={{ unmountOnExit: true }} expanded={selectedPanel === carrierId}>
                  <ExpansionPanelSummary
                    aria-controls="panel1c-content"
                    expandIcon={<ExpandMoreIcon />}
                    onClick={() => handlePanelClick(carrierId)}
                  >
                    <Typography variant="h4">{carrierId}</Typography>
                  </ExpansionPanelSummary>

                  <ExpansionPanelDetails>
                    <Grid container>
                      <Grid item xs={12}>
                        <Paper className={classes.tableScroll}>
                          <Table size="small" aria-label="a dense table">
                            <TableHead className={classes.tableHead}>
                              <TableRow className={classes.tableRow}>
                                <TableCell />
                                {quotes.map((quote, index) => (
                                  <Fragment key={index}>
                                    <TableCell
                                      className={`${classes.currencyCell} ${
                                        index % 2 === 0 ? classes.alternateCell : null
                                      }`}
                                    >
                                      Currency
                                    </TableCell>
                                    <TableCell
                                      className={`${index % 2 === 0 ? classes.alternateCell : null}`}
                                      align="right"
                                    >
                                      Cost Value
                                    </TableCell>
                                    <TableCell className={`${index % 2 === 0 ? classes.alternateCell : null}`}>
                                      Cost Unit
                                    </TableCell>
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
                                  <TableRow key={i} className={classes.tableRow}>
                                    <TableCell component="th" scope="row">
                                      {quoteDetail.Description}
                                    </TableCell>
                                    {quotes.map((quote: any, index) => {
                                      const matchingQuoteDetail = quote.quoteDetails.find(
                                        (item: QuoteDetail) =>
                                          quoteDetail.Description === item.Description &&
                                          quoteDetail.CostUnit === item.CostUnit &&
                                          quoteDetail.Currency === item.Currency,
                                      );
                                      return matchingQuoteDetail ? (
                                        <Fragment key={index}>
                                          <TableCell
                                            className={`${classes.currencyCell} ${
                                              index % 2 === 0 ? classes.alternateCell : null
                                            }`}
                                          >
                                            {matchingQuoteDetail.Currency !== 'incl.'
                                              ? matchingQuoteDetail.Currency
                                              : ''}
                                          </TableCell>
                                          <TableCell
                                            className={`${index % 2 === 0 ? classes.alternateCell : null}`}
                                            align="right"
                                            style={{ width: '3em' }}
                                          >
                                            {' '}
                                            {matchingQuoteDetail.CostValue}
                                          </TableCell>
                                          <TableCell className={`${index % 2 === 0 ? classes.alternateCell : null}`}>
                                            {matchingQuoteDetail.Currency === 'incl.'
                                              ? matchingQuoteDetail.Currency
                                              : ''}{' '}
                                            {matchingQuoteDetail.CostUnit}
                                          </TableCell>
                                        </Fragment>
                                      ) : (
                                        <TableCell colSpan={3} />
                                      );
                                    })}
                                  </TableRow>
                                ))}

                              <TableRow>
                                <TableCell component="th" scope="row">
                                  Service Details
                                </TableCell>
                                {quotes.map((quote: any, index) => (
                                  <Fragment key={index}>
                                    <TableCell
                                      key={quote.QuoteNumber}
                                      className={`${index % 2 === 0 ? classes.alternateCell : null}`}
                                      colSpan={3}
                                      align="center"
                                    >
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
                                    <TableCell
                                      className={`${index % 2 === 0 ? classes.alternateCell : null}`}
                                      colSpan={3}
                                      align="center"
                                    >
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

                                {quotes.map((quote, index) => (
                                  <Fragment key={quote.id}>
                                    <TableCell
                                      className={`${classes.buttonContainer} ${
                                        index % 2 === 0 ? classes.alternateCell : null
                                      }`}
                                      colSpan={3}
                                    >
                                      <QuoteItemActionButtons quote={quote} />
                                    </TableCell>
                                  </Fragment>
                                ))}
                              </TableRow>
                            </TableFooter>
                          </Table>
                        </Paper>
                      </Grid>
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Fragment>
  );
};

export default QuoteGroup;
