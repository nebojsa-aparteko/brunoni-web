import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
import { buildSpecialRequestLink } from './quotes/QuoteBookingBodyTextSharePrep';
import useUser from '../hooks/useUser';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import FlareIcon from '@material-ui/icons/Flare';
import Meta from './Meta';
import { getEntity, normalizeQuoteGroups, Quote, QuoteDetail, QuoteGroup } from '../providers/QuoteGroupsProvider';
import QuoteNav from './quotes/QuoteItemNav';
import { quoteRouteLabelDisplay } from '../utilities/formattedPortDisplay';
import useUserByAlphacomId from '../hooks/useUserByAlphacomId';
import Carriers from '../contexts/Carriers';
import QuoteGroupActivityLogContainer from './activities/QuoteGroupActivityLogContainer';
import UserRecord, { isSuperAdmin } from '../model/UserRecord';
import firebase from '../firebase';
import UserAssignment from './UserAssignment';
import { ActivityLogProvider } from './bookings/checklist/ActivityLogContext';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import ContainerTypes from '../contexts/ContainerTypes';
import CommodityTypes from '../contexts/CommodityTypes';
import PickupLocations from '../contexts/PickupLocations';
import Ports from '../contexts/Ports';
import { useHistory } from 'react-router';
import SchedulePicker from './bookingRequests/SchedulePicker';
import { RouteSearchResult } from '../model/route-search/RouteSearchResults';
import BookNowButton from './BookNowButton';
import ActingAs from '../contexts/ActingAs';

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
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const history = useHistory();

  const [user, userData] = useUser();
  const client = userData?.company!;

  const onMoreButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMoreAnchorEl(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleBookNow = (schedule?: RouteSearchResult) => {
    localStorage.setItem('quote', JSON.stringify(quote));
    localStorage.setItem('schedule', JSON.stringify(schedule));
    history.push('/online-booking');
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" className={classes.buttons}>
      <SchedulePicker
        isOpen={isDialogOpen}
        handleClose={handleDialogClose}
        quote={quote}
        handleBookNow={handleBookNow}
      />
      <Button color="primary" variant="outlined" component={RouterLink} size="small" to={`/quotes/${quote.id}`}>
        View more
      </Button>
      <BookNowButton bookNow={handleDialogOpen} />
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

export const addAssignee = (user: UserRecord | null, quoteId: string) => {
  return firebase
    .firestore()
    .collection('quotes')
    .doc(quoteId)
    .update('assignedTo', user);
};

const QuoteGroupView: React.FC<Props> = ({ id, showCompanyInfo }) => {
  const classes = useStyles();

  const [isLoading, setIsLoading] = useState(true);
  const [quoteGroup, setQouteGroup] = useState<QuoteGroup | undefined>(undefined);

  const [quotesByCarrier, setQuotesByCarrier] = useState<[string, Quote[]][] | undefined>(undefined);

  const [selectedPanel, setSelectedPanel] = useState('');

  const history = useHistory();
  const [, userRecord] = useUser();
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;

  const containerTypes = useContext(ContainerTypes);
  const commodityTypes = useContext(CommodityTypes);
  const pickupLocations = useContext(PickupLocations);
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);

  const quotesSnapshot = useFirestoreCollection(
    'quotes',
    useCallback(
      q => {
        q = q.where('groupId', '==', id);
        if (isSuperAdmin(userRecord) || !isAdmin) {
          return q;
        }
        return q.where(
          'carrier',
          'in',
          carriers && carriers.length > 0 && userRecord.carriers && userRecord.carriers.length > 0
            ? userRecord.carriers?.map(carrierId => {
                const carrier = carriers?.find(carrier => carrier.id === carrierId);
                if (carrier) {
                  return carrier.name;
                }
              })
            : ['NONE FOUND'], //This should always fail and we won't fetch any results, if a better solution is found please change this
        );
      },
      [id, carriers, userRecord],
    ),
  );

  useEffect(() => {
    if (!(quotesSnapshot && containerTypes && commodityTypes && pickupLocations && ports && carriers)) {
      return;
    }

    if (quotesSnapshot && quotesSnapshot.size > 0) {
      const quotes = quotesSnapshot?.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data(),
        } as Quote;
      }) as Quote[] | undefined;

      const normalize = (quotes: Quote[]) => {
        const getContainerType = getEntity(containerTypes, containerType => containerType.id);
        const getCommodityType = getEntity(commodityTypes, commodityType => commodityType.id);
        const getPickupLocation = getEntity(pickupLocations, pickupLocation => pickupLocation.id);
        const getPort = getEntity(ports, port => port.id);
        const getCarrier = getEntity(carriers, carrier => carrier.name);

        return normalizeQuoteGroups(getContainerType, getCommodityType, getPickupLocation, getPort, getCarrier)(quotes);
      };

      const normalizedQuoteGroup = quotes === undefined ? undefined : normalize(quotes).pop();

      const quotesByCarrierNormalized = normalizedQuoteGroup
        ? (flow(get('quotes'), groupBy('carrier.id'), toPairs)(normalizedQuoteGroup) as Array<[string, Quote[]]>)
        : undefined;

      setQouteGroup(normalizedQuoteGroup);
      setQuotesByCarrier(quotesByCarrierNormalized);
    }
    setIsLoading(false);
  }, [quotesSnapshot, containerTypes, commodityTypes, pickupLocations, ports, carriers]);

  useEffect(() => {
    if (quotesByCarrier && quotesByCarrier?.length === 1) {
      setSelectedPanel(quotesByCarrier[0][0]);
    }
  }, [quotesByCarrier]);

  const requestedBy = useUserByAlphacomId(quoteGroup?.quotes[0].userId);

  const setAssignedUser = (user: UserRecord | null, quotes: any) => {
    const updateBatch = firebase.firestore().batch();

    quotes.map((quote: Quote) =>
      updateBatch.update(
        firebase
          .firestore()
          .collection('quotes')
          .doc(quote.id),
        { assignedTo: user },
      ),
    );

    updateBatch
      .commit()
      .then(_ => {
        console.log('Success assignee');
      })
      .catch(error => console.log(`Error while assignment in quote ${error}`));
  };

  const clientInfo = useMemo(() => {
    if (!showCompanyInfo) {
      return null;
    }

    return (
      <Box mt={2} mb={2}>
        <Typography variant="body2">
          <span style={{ fontWeight: 700 }}>Quote for: </span>{' '}
          {requestedBy?.company
            ? requestedBy.company.name + ', ' + requestedBy.company.city
            : quoteGroup?.quotes[0].clientId}
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
  }, [showCompanyInfo, quoteGroup, requestedBy]);

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <ChartsCircularProgress />
      </Container>
    );
  }

  if (!isLoading && !quoteGroup) {
    history.push('/not-found');
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
            subtitle={quoteGroup ? `${formatDate(quoteGroup.dateIssued, 'd. MMMM yyyy')}` : ''}
          />
        </Box>

        <Box mx={2} mt={2} mb={6}>
          {clientInfo}
          <Grid container spacing={2}>
            {quoteGroup?.containers?.map((container, i) => (
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
        <Box id="optionsQuoteGroup" mb={6}>
          {quotesByCarrier?.map(([carrierId, quotes], index) => {
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
                    <Box flex="1" />
                    <div id="assignedAdminQuoteGroup">
                      <UserAssignment
                        onChange={(user: UserRecord | null) => setAssignedUser(user, quotes)}
                        value={(quotes[0] as Quote).assignedTo}
                      />
                    </div>
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
                                  <Fragment key={`${quote.id}-${index}`}>
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
        <ActivityLogProvider>
          {/*<InternalStorage id={quoteGroup?.id} collection={}/>*/}
          {/*TODO This should be visible only for admins*/}
          {quoteGroup && <QuoteGroupActivityLogContainer groupId={quoteGroup.id} quote={quoteGroup?.quotes?.[0]} />}
        </ActivityLogProvider>
      </Container>
    </Fragment>
  );
};

export default QuoteGroupView;
