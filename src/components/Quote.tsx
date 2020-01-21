import React, { useContext, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Theme,
  Typography,
  Button,
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
import formatDate from 'date-fns/format';
import { buildMailToLink, buildSpecialRequestLink } from './quotes/QuoteBookingBodyTextSharePrep';
import useUser from '../hooks/useUser';
import FlareIcon from '@material-ui/icons/Flare';
import QuoteGroups from '../contexts/QuoteGroups';
import QuoteNav from './quotes/QuoteItemNav';
import { portLongFormatLabel } from '../utilities/formattedPortDisplay';
import changeCase from 'change-case';
import useClients from '../hooks/useClients';
import ContainerType from '../model/Container';
import { Quote as QuoteModel } from '../providers/QuoteGroups';

interface Props {
  id: string;
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
  `${quote.carrier.name || quote.carrier.id} - ${
    quote.placeOfDeliveryName ? quote.placeOfDeliveryName : portLongFormatLabel(quote.destination)
  }`;

const handleSpecialRequest = (quote: QuoteModel) => {
  Intercom('showNewMessage', `Hello I have a special request for quote #${quote.id} - ${buildQuoteTile(quote)}`);
};

const Quote: React.FC<Props> = ({ id, showCompanyInfo }) => {
  const classes = useStyles();

  const quoteGroups = useContext(QuoteGroups);
  const [user, userData] = useUser();
  const clients = useClients();

  const theme = useTheme();
  const isSmAndDown = useMediaQuery(theme.breakpoints.down('xs'));

  if (!quoteGroups) {
    return (
      <Container maxWidth="lg">
        <Paper className={classes.root}>
          <ChartsCircularProgress />
        </Paper>
      </Container>
    );
  }

  const quoteGroup = (quoteGroups || []).find(group => Boolean(group.quotes.find(quote => quote.id === id)));

  const quote = quoteGroup?.quotes.find(quote => quote.id === id);

  if (!quoteGroup || !quote) {
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

  Intercom('update', {
    quote_last_viewed_carrier: quote.carrier.name || quote.carrier.id,
    quote_last_viewed_id: quote.id,
    quote_last_viewed_link:
      process.env.REACT_APP_BRAND === 'brunoni'
        ? `https://mybrunoni.ch/quotes/${quote.id}`
        : `https://myallmarine.ch/quotes/${quote.id}`,
  });

  Intercom('trackEvent', 'viewed-quote', {
    quoteId: quote.id,
    quoteLink:
      process.env.REACT_APP_BRAND === 'brunoni'
        ? `https://mybrunoni.ch/quotes/${quote.id}`
        : `https://myallmarine.ch/quotes/${quote.id}`,
    origin: quote.origin.id,
    destination: quote.destination.id,
    date: quote.dateIssued.toISOString(),
    containers: JSON.stringify(
      quote.containers.map((container: ContainerType) => ({
        type: container.containerType!.id,
        commodity: container.commodityType!.id,
        location: container.pickupLocation?.id,
        quantity: container.quantity,
      })),
    ),
  });

  return (
    <Page title={quoteTitle}>
      <Container maxWidth="lg">
        <ScrollToTopOnMount />
        <Paper className={classes.root}>
          <Box display="none" displayPrint="block" mb={2}>
            <Box mb={2}>
              <img
                src={require(`../assets/logo.${process.env.REACT_APP_BRAND}.png`)}
                alt={changeCase.titleCase(process.env.REACT_APP_BRAND || '')}
                style={{ width: '5em' }}
              />
            </Box>
            <Divider />
          </Box>
          <Box className={classes.actionBar} mb={2} display="flex" alignItems="end" justifyContent="space-between">
            <QuoteNav
              backTo={
                quote.groupId !== quote.id && quoteGroup.quotes.length > 1
                  ? `/quotes/groups/${quote.groupId}`
                  : `/quotes/groups`
              }
              title={`Quotation - ${quoteTitle}`}
              subtitle={`${formatDate(quote.dateIssued, 'd. MMMM yyyy')}`}
            />

            <Box className={classes.actions} displayPrint="none">
              <Button
                color="primary"
                variant="contained"
                size="small"
                href={buildMailToLink(quote, [user, userData, client!])}
                target="_blank"
              >
                Book Now
              </Button>

              <Button
                aria-label="print"
                variant="outlined"
                size="small"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button
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
                  <QuoteItemHeader quote={quote} userData={userData} showCompanyInfo={showCompanyInfo} />
                </Grid>
                <Grid item md={6} xs={12} className={classes.hidePrint}>
                  <QuoteItemContainers containers={quote.containers} commodityTypes={quote.commodityTypes} />
                </Grid>

                <Grid item xs={12}>
                  <Box display="none" displayPrint="block" width="100%">
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <QuoteItemHeader quote={quote} userData={userData} />
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
  );
};

export default Quote;
