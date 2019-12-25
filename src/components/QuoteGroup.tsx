import React, { useContext, Fragment, useState, useEffect, useMemo } from 'react';
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
import identity from 'lodash/fp/identity';
import invoke from 'lodash/fp/invoke';
import groupBy from 'lodash/fp/groupBy';
import orderBy from 'lodash/fp/orderBy';
import toPairs from 'lodash/fp/toPairs';
import padStart from 'lodash/fp/padStart';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import uniqWith from 'lodash/fp/uniqWith';
import { Link as RouterLink } from 'react-router-dom';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import quoteDetailFilterList from '../utilities/quoteDetailFilterList';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { buildMailToLink, buildSpecialRequestLink } from './quotes/QuoteBookingBodyTextSharePrep';
import useUser from '../hooks/useUser';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import FlareIcon from '@material-ui/icons/Flare';
import Meta from './Meta';
import QuoteGroups from '../contexts/QuoteGroups';
import { Quote, QuoteDetail } from '../providers/QuoteGroups';
import QuoteNav from './quotes/QuoteItemNav';
import { quoteRouteLabelDisplay } from '../utilities/formattedPortDisplay';
import UserRecords from '../contexts/UserRecords';
import useClients from '../hooks/useClients';
import useUserByAlphacomId from '../hooks/useUserByAlphacomId';
import Carriers from '../contexts/Carriers';

interface Props {
  id: string;
  showCompanyInfo?: boolean;
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
  borderCell: {
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
}));

interface ActionButtonsProps {
  quote: Quote;
}

const QuoteItemActionButtons: React.FC<ActionButtonsProps> = ({ quote }) => {
  const classes = useStyles();
  const [moreAnchorEl, setMoreAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const [user, userData, client] = useUser();

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
        href={buildMailToLink(quote, [user, userData, client])}
        target="_blank"
      >
        Book Now
      </Button>
      <IconButton aria-label="actions" onClick={onMoreButtonClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu id="actions" anchorEl={moreAnchorEl} keepMounted open={Boolean(moreAnchorEl)} onClose={handleClose}>
        <MenuItem component="a" href={buildSpecialRequestLink(quote, [user, userData, client])} target="_blank">
          <ListItemIcon>
            <FlareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="SPECIAL REQUEST?" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

const QuoteGroup: React.FC<Props> = ({ id, showCompanyInfo }) => {
  const classes = useStyles();

  const carriers = useContext(Carriers);
  const quoteGroups = useContext(QuoteGroups);
  const clients = useClients();

  const [selectedPanel, setSelectedPanel] = useState('');

  const quoteGroup = useMemo(() => quoteGroups?.find(quoteGroup => quoteGroup.id === id), [quoteGroups]);
  const client = useMemo(() => clients?.find(client => client.id === quoteGroup?.quotes[0].clientId), [
    quoteGroup,
    clients,
  ]);

  const quotesByCarrier = useMemo(
    () =>
      quoteGroup
        ? (flow(get('quotes'), groupBy('carrier.id'), toPairs)(quoteGroup) as Array<[string, Quote[]]>)
        : undefined,
    [quoteGroup],
  );

  useEffect(() => {
    if (quotesByCarrier && quotesByCarrier.length === 1) {
      setSelectedPanel(quotesByCarrier[0][0]);
    }
  }, [quoteGroup]);

  const users = useContext(UserRecords);
  const requestedBy = useUserByAlphacomId(quoteGroup?.quotes[0].userId);

  const clientInfo = useMemo(() => {
    if (!showCompanyInfo) {
      return null;
    }

    return (
      <Box mt={2} mb={2}>
        <Typography variant="body2">
          <span style={{ fontWeight: 700 }}>Quote for: </span>{' '}
          {client ? client.name + ', ' + client.city : quoteGroup?.quotes[0].clientId}
        </Typography>
        {quoteGroup?.quotes[0].userId && (
          <Typography variant="body2">
            <span style={{ fontWeight: 700 }}>Requested by: </span>{' '}
            {requestedBy
              ? [requestedBy.firstName, requestedBy.lastName]
                  .filter(identity)
                  .map(invoke('trim'))
                  .join(' ') ||
                requestedBy.emailAddress ||
                quoteGroup?.quotes[0].userId
              : quoteGroup?.quotes[0].userId}
          </Typography>
        )}
      </Box>
    );
  }, [showCompanyInfo, users, quoteGroup, client, requestedBy]);

  if (!quoteGroup) {
    return (
      <Container maxWidth="lg">
        <ChartsCircularProgress />
      </Container>
    );
  }

  return !quotesByCarrier ? (
    <Container maxWidth="lg">
      <ChartsCircularProgress />
    </Container>
  ) : (
    <Fragment>
      <Meta title={quoteRouteLabelDisplay(quoteGroup) || ''} />
      <Container maxWidth="lg">
        <Box mt={6}>
          <QuoteNav
            backTo="/quotes/groups"
            title={`Quotations - ${quoteRouteLabelDisplay(quoteGroup)}`}
            subtitle={`${formatDate(quoteGroup.dateIssued, 'd. MMMM yyyy')}`}
          />
        </Box>

        <Box mx={2} mt={2} mb={6}>
          {clientInfo}
          <Grid container spacing={2}>
            {quoteGroup.containers.map((container, i) => (
              <Grid item key={i}>
                <Chip
                  label={
                    (container.quantity > 1 ? container.quantity + ' × ' : '') +
                    container!.containerType?.description +
                    (container?.commodityType?.name ? ', ' + container?.commodityType?.name : '')
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
                    <Typography variant="h4">
                      {carriers?.find(carrier => carrier.id === carrierId)?.name || carrierId}
                    </Typography>
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
                                    <TableCell align="right" className={classes.borderCell}>
                                      Currency
                                    </TableCell>
                                    <TableCell align="right">Cost Value</TableCell>
                                    <TableCell>Cost Unit</TableCell>
                                  </Fragment>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {quoteDetailItemsMerged
                                .filter(quoteDetail =>
                                  quoteDetailFilterList.includes((quoteDetail.Description || '').toLowerCase()),
                                )
                                .map((quoteDetail, i) => (
                                  <TableRow key={i} className={classes.tableRow} selected={(i + 1) % 2 === 0}>
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
                                          <TableCell className={`${classes.currencyCell} ${classes.borderCell}`}>
                                            {matchingQuoteDetail.Currency !== 'incl.'
                                              ? matchingQuoteDetail.Currency
                                              : ''}
                                          </TableCell>
                                          <TableCell align="right" style={{ width: '3em' }}>
                                            {' '}
                                            {matchingQuoteDetail.CostValue}
                                          </TableCell>
                                          <TableCell>
                                            {matchingQuoteDetail.Currency === 'incl.'
                                              ? matchingQuoteDetail.Currency
                                              : ''}{' '}
                                            {matchingQuoteDetail.CostUnit}
                                          </TableCell>
                                        </Fragment>
                                      ) : (
                                        <TableCell colSpan={3} className={classes.borderCell} />
                                      );
                                    })}
                                  </TableRow>
                                ))}

                              <TableRow className={classes.tableRow}>
                                <TableCell component="th" scope="row">
                                  Service Details
                                </TableCell>
                                {quotes.map((quote: any, index) => (
                                  <Fragment key={index}>
                                    <TableCell
                                      key={quote.QuoteNumber}
                                      colSpan={3}
                                      align="center"
                                      className={classes.borderCell}
                                    >
                                      {quote.serviceDetails[0]?.Frequency} {quote.serviceDetails[0]?.Routing}{' '}
                                      {quote.serviceDetails[0]?.TransitTime} days
                                    </TableCell>
                                  </Fragment>
                                ))}
                              </TableRow>

                              <TableRow selected className={classes.tableRow}>
                                <TableCell component="th" scope="row">
                                  Quote Validity
                                </TableCell>
                                {quotes.map((quote, index) => (
                                  <Fragment key={index}>
                                    <TableCell colSpan={3} align="center" className={classes.borderCell}>
                                      {formatDate(quote.validityPeriod.from, 'd. MMMM')} –{' '}
                                      {formatDate(quote.validityPeriod.to, 'd. MMMM')}
                                    </TableCell>
                                  </Fragment>
                                ))}
                              </TableRow>
                            </TableBody>
                            <TableFooter>
                              <TableRow className={classes.tableRow}>
                                <TableCell className={classes.noBorder} />

                                {quotes.map((quote, index) => (
                                  <Fragment key={quote.id}>
                                    <TableCell
                                      className={`${classes.buttonContainer} ${classes.borderCell}`}
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
