import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import Page from './quotes/Page';
import QuoteItemHeader from './quotes/QuoteItemHeader';
import QuoteItemContainers from './quotes/QuoteItemContainers';
import QuoteItemTerms from './quotes/QuoteItemTerms';
import QuoteItemQuoteDetails from './quotes/QuoteItemQuoteDetails';
import QuoteItemCostDetailsRemark from './quotes/QuoteItemCostDetailsRemark';
import QuoteItemServiceDetail from './quotes/QuoteItemServiceDetail';
import QuoteItemRemarks from './quotes/QuoteItemRemarks';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import SearchEmptyResults from './routeSearch/SearchEmptyResults';
import PrintIcon from '@material-ui/icons/Print';
import { buildSpecialRequestLink } from './quotes/QuoteBookingBodyTextSharePrep';
import useUser from '../hooks/useUser';
import FlareIcon from '@material-ui/icons/Flare';
import QuoteNav from './quotes/QuoteItemNav';
import { portLongFormatLabel } from '../utilities/formattedPortDisplay';
import * as changeCase from 'change-case';
import useClients from '../hooks/useClients';
import ContainerType from '../model/Container';
import { Quote, Quote as QuoteModel, QuoteStatus, QuoteStatusText } from '../providers/QuoteGroupsProvider';
import ActingAs from '../contexts/ActingAs';
import QuoteActivityLogContainer from './activities/QuoteActivityLogContainer';
import UserRecord from '../model/UserRecord';
import { addAssignee } from './QuoteGroupView';
import firebase from '../firebase';
import UserAssignment from './UserAssignment';
import InternalStorage from './bookings/InternalStorage';
import { ActivityLogProvider } from './bookings/checklist/ActivityLogContext';
import { formatDateSafe } from '../utilities/formattingHelpers';
import { useSnackbar } from 'notistack';
import { GlobalContext } from '../store/GlobalStore';
import { SHOW_ERROR_SNACKBAR } from '../store/types/globalAppState';
import SchedulePicker from './bookingRequests/SchedulePicker';
import { RouteSearchResult } from '../model/route-search/RouteSearchResults';
import { useHistory } from 'react-router';
import { getLogo } from './Navbar';

interface Props {
  quote?: Quote;
  loading?: boolean;
  showCompanyInfo?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(5),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(3),
    },

    ['@media print']: {
      marginTop: theme.spacing(0),
      paddingTop: theme.spacing(0),
    },
  },
  logo: {
    width: '5em',
    ['@media print']: {
      width: '20em',
    },
  },
  title: {
    fontSize: '1.2em',
  },
  actionBar: {
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
    ['@media print']: {
      marginBottom: theme.spacing(0),
    },
  },
  actions: {
    '& > *': {
      marginLeft: theme.spacing(1),
    },
  },
  hidePrint: {
    ['@media print']: {
      display: 'none',
    },
  },
}));

const handlePrint = () => {
  window.print();
};

function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}

const buildQuoteTile = (quote: QuoteModel) =>
  `${quote.carrier?.name || quote.carrier?.id} - ${
    quote.placeOfDeliveryName ? quote.placeOfDeliveryName : portLongFormatLabel(quote.destination)
  }`;

const handleSpecialRequest = (quote: QuoteModel) => {
  try {
    $crisp.push(['do', 'chat:open']);
  } catch (e) {
    console.warn('Failed to push crisp command.');
  }
  try {
    $crisp.push([
      'set',
      'message:text',
      [`Hello I have a special request for quote #${quote.id} - ${buildQuoteTile(quote)}`],
    ]);
  } catch (e) {
    console.warn('Failed to push crisp command.');
  }
};

export const addStatus = (status: QuoteStatus | null, quoteId: string) => {
  return firebase
    .firestore()
    .collection('quotes')
    .doc(quoteId)
    .update('status', status);
};

const QuoteView: React.FC<Props> = ({ quote, loading, showCompanyInfo }) => {
  const classes = useStyles();

  const [user, userData] = useUser();
  const clients = useClients();
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const theme = useTheme();
  const isSmAndDown = useMediaQuery(theme.breakpoints.down('xs'));
  const [actingAs] = useContext(ActingAs);
  const [, dispatch] = useContext(GlobalContext);

  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState(!actingAs);
  useEffect(() => {
    setIsAdmin(!actingAs);
  }, [actingAs]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Paper className={classes.root}>
          <ChartsCircularProgress />
        </Paper>
      </Container>
    );
  }

  if (!quote) {
    return (
      <SearchEmptyResults
        message={
          'Quote that you are trying to get cannot be found. Please try going back to quotes page and selecting the quote form there.'
        }
      />
    );
  }

  const client = clients?.find(client => client.id === quote.clientId);

  const quoteTitle = buildQuoteTile(quote);

  try {
    $crisp.push([
      'set',
      'session:data',
      [
        [
          ['quote-last-viewed-carrier', String(quote.carrier.name || quote.carrier.id)],
          ['quote-last-viewed-id', String(quote.id)],
          [
            'quote-last-viewed-link',
            String(
              process.env.REACT_APP_BRAND === 'brunoni'
                ? `https://mybrunoni.ch/quotes/${quote.id}`
                : `https://myallmarine.ch/quotes/${quote.id}`,
            ),
          ],
        ],
      ],
    ]);
  } catch (e) {
    console.warn('Failed to push crisp command.');
  }

  try {
    $crisp.push([
      'set',
      'session:event',
      [
        [
          [
            'viewed-quote',
            {
              quoteId: String(quote.id),
              quoteLink: String(
                process.env.REACT_APP_BRAND === 'brunoni'
                  ? `https://mybrunoni.ch/quotes/${quote.id}`
                  : `https://myallmarine.ch/quotes/${quote.id}`,
              ),
              origin: String(quote.origin.id),
              destination: String(quote.destination.id),
              date: quote.dateIssued.toISOString().slice(0, 10),
              containers: JSON.stringify(
                quote.containers.map((container: ContainerType) => ({
                  type: container.containerType!.id,
                  commodity: container.commodityType!.id,
                  location: container.pickupLocation?.id,
                  quantity: container.quantity,
                })),
              ),
            },
            'black',
          ],
        ],
      ],
    ]);
  } catch (e) {
    console.warn('Failed to push crisp command.');
  }

  const setAssignedUser = (user: UserRecord | null, quoteId: any) => {
    // do something with this
    addAssignee(user, quoteId)
      .then(_ => {
        enqueueSnackbar(<Typography color="inherit">Saved user successfully!</Typography>, {
          variant: 'success',
        });
        console.log('Success assignee');
      })
      .catch(error => {
        console.log(`Error while assignment in quote ${error}`);
        dispatch({
          type: SHOW_ERROR_SNACKBAR,
          message: `There was an error ${error}`,
        });
      });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>, quoteId: string) => {
    addStatus(event.target.value as QuoteStatus, quoteId).then(_ => console.log('Successful status change'));
  };

  const handleBookNow = (schedule?: RouteSearchResult) => {
    localStorage.setItem('quote', JSON.stringify(quote));
    localStorage.setItem('schedule', JSON.stringify(schedule));
    history.push('/online-booking');
  };

  return (
    <Grid container direction="row" spacing={2} justify="center" alignItems="flex-start">
      <Grid item md={7} xs={12}>
        <Page title={quoteTitle}>
          <Container maxWidth="lg">
            <ScrollToTopOnMount />
            <Paper className={classes.root}>
              <Box display="none" displayPrint="block" mb={2}>
                <Box mb={2}>
                  <img
                    src={getLogo()}
                    alt={changeCase.capitalCase(process.env.REACT_APP_BRAND || '')}
                    className={classes.logo}
                  />
                </Box>
                <Divider />
              </Box>
              <Box className={classes.actionBar} mb={2} display="flex" alignItems="end" justifyContent="space-between">
                <QuoteNav
                  backTo={
                    quote.id && quote?.groupId && quote.groupId !== quote.id
                      ? `/quotes/groups/${quote.groupId}`
                      : `/quotes/groups`
                  }
                  title={`Quotation - ${quoteTitle}`}
                  subtitle={`${formatDateSafe(quote.dateIssued, 'd. MMMM yyyy')}`}
                />

                <Box className={classes.actions} displayPrint="none">
                  <Button
                    id="bookNowButtonQuote"
                    color="primary"
                    variant="contained"
                    size="small"
                    onClick={handleDialogOpen}
                    // href={buildMailToLink(quote, [user, userData, client!])}
                    // target="_blank"
                  >
                    Book Now
                  </Button>

                  <Button
                    id="printQuote"
                    aria-label="print"
                    variant="outlined"
                    size="small"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                  >
                    Print
                  </Button>
                  <Button
                    id="specialRequestQuote"
                    aria-label="special request"
                    variant="outlined"
                    size="small"
                    startIcon={<FlareIcon />}
                    onClick={() => handleSpecialRequest(quote)}
                    href={buildSpecialRequestLink(quote, [user, userData, client!])}
                    target="_blank"
                  >
                    {isSmAndDown ? 'SPEC REQ' : 'SPECIAL REQUEST'}
                  </Button>
                </Box>
              </Box>
              <Grid item xs={12}>
                <Page title={quoteTitle}>
                  <Grid container spacing={2}>
                    <Grid item md={6} xs={12} className={classes.hidePrint}>
                      <QuoteItemHeader quote={quote} showCompanyInfo={showCompanyInfo} />
                    </Grid>
                    <Grid item md={6} xs={12} className={classes.hidePrint}>
                      <QuoteItemContainers containers={quote.containers} commodityTypes={quote.commodityTypes} />
                    </Grid>

                    <Grid item xs={12}>
                      <Box display="none" displayPrint="block" width="100%">
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <QuoteItemHeader quote={quote} />
                          </Grid>
                          <Grid item xs={6}>
                            <QuoteItemContainers containers={quote.containers} commodityTypes={quote.commodityTypes} />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <QuoteItemTerms terms={quote.terms} />
                    <QuoteItemQuoteDetails quoteDetails={quote.quoteDetails} />
                    <QuoteItemCostDetailsRemark costDetailRemarks={quote.costDetailRemarks} />
                    <QuoteItemServiceDetail serviceDetails={quote.serviceDetails} />
                    <QuoteItemRemarks remarks={quote.remarks} />
                  </Grid>

                  <Box displayPrint="block" display="none" marginTop="1em">
                    <Divider />
                    <Typography variant="body1">
                      <br />
                      <br />
                      {process.env.REACT_APP_BRAND === 'brunoni' ? (
                        <span>Your Brunoni-Team</span>
                      ) : process.env.REACT_APP_BRAND === 'allmarine' ? (
                        <span>Your Allmarine-Team</span>
                      ) : null}
                      <br />
                      {process.env.REACT_APP_BRAND === 'brunoni' ? (
                        <span>Tel. 044 455 58 58</span>
                      ) : process.env.REACT_APP_BRAND === 'allmarine' ? (
                        <span>Tel. 044 533 38 48</span>
                      ) : null}
                      <br />
                      {process.env.REACT_APP_BRAND === 'brunoni' ? (
                        <span>info@brunoni.ch</span>
                      ) : process.env.REACT_APP_BRAND === 'allmarine' ? (
                        <span>info@allmarine.ch</span>
                      ) : null}
                    </Typography>
                  </Box>
                </Page>
              </Grid>
            </Paper>
          </Container>
        </Page>
      </Grid>
      {
        <Grid item md={4} xs={12} style={{ marginTop: theme.spacing(2) }}>
          {isAdmin && (
            <Box display="flex" justifyContent="center" flexDirection="column" displayPrint="none">
              <UserAssignment
                onChange={(user: UserRecord | null) => setAssignedUser(user, quote!.id)}
                value={quote?.assignedTo}
              />
              <FormControl>
                <InputLabel id="quote-status-select-label" shrink>
                  Quote Status
                </InputLabel>
                <Select
                  labelId="quote-status-select-label"
                  id="quote-status-select"
                  value={quote!.status || ''}
                  onChange={event => handleChange(event, quote.id)}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {Object.keys(QuoteStatus)
                    .filter(key => typeof QuoteStatus[key as any] !== 'number')
                    .map((status: string | QuoteStatus, index) => (
                      <MenuItem value={Number(status)} key={`menuItem-${index}`}>
                        {Object.values(QuoteStatusText)[index]}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          )}
          <Box displayPrint="none">
            <ActivityLogProvider>
              {!actingAs && <InternalStorage id={quote!.id} collection={'quotes'} />}
              <QuoteActivityLogContainer quoteId={quote.id} quote={quote} />
            </ActivityLogProvider>
          </Box>
          {isDialogOpen && (
            <SchedulePicker
              isOpen={isDialogOpen}
              handleClose={handleDialogClose}
              quote={quote}
              handleBookNow={handleBookNow}
            />
          )}{' '}
        </Grid>
      }
    </Grid>
  );
};

export default QuoteView;
