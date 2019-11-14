import React, { Fragment, useEffect, useState } from 'react';
import Sticky from 'react-stickynode';
import querySting from 'querystring';
import formatDate from 'date-fns/format';
import set from 'lodash/fp/set';
import update from 'lodash/fp/update';
import {
  Theme,
  makeStyles,
  Box,
  Paper,
  Grid,
  Divider,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RouteSearchParams from '../model/route-search/RouteSearchParams';
import RouteSearchResults from '../model/route-search/RouteSearchResults';
import RouteSearchBar from './RouteSearchBar';
import RouteSearchFilters from './RouteSearchFilters';
import RouteSearchSorting, { Sorting, sortingOptions } from './RouteSearchSorting';
import Container from './Container';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import { Skeleton } from '@material-ui/lab';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import FlagIcon from '@material-ui/icons/Flag';

interface DotProps {
  noLine: boolean;
}

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  hideSearch: {
    width: '100%',
    background: 'transparent',
    boxShadow: 'none',
  },
  hero: {
    '> .sticky-outer-wrapper > .sticky-inner-wrapper': {
      display: 'flex',
    },
    background: `url(${require(`../assets/hero.${process.env.REACT_APP_BRAND}.jpg`)})`,
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
  sidebar: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  sorting: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
  route: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(4),
  },
  routePoint: {
    padding: theme.spacing(2),
    position: 'relative',
  },
  paper: {
    padding: theme.spacing(4),
    paddingLeft: '6em',
    marginBottom: theme.spacing(2),
  },
  chip: {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.white,
  },
  stepsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  dotAndLine: {
    position: 'absolute',
    height: '100%',
  },
  dot: {
    width: '2em',
    height: '2em',
    borderRadius: '16px',
    backgroundColor: theme.palette.common.white,
    border: `3px solid ${theme.palette.primary.main}`,
    position: 'absolute',
    left: '2em',
    top: '3.45em',
    zIndex: 2,
  },
  line: {
    content: '',
    width: '3px',
    height: '100%',
    position: 'absolute',
    left: '2.9em',
    top: '3.45em',
    backgroundColor: theme.palette.primary.main,
    zIndex: 1,
  },
  wrapper: {
    position: 'relative',
  },
}));

const formatDateString = (date: string) => formatDate(new Date(date), 'd. MMMM');

const initialResults = process.env.NODE_ENV !== 'production' ? require('../test/RoutesSearchDataTest.json') : undefined;

const RouteSearch: React.FC<Props> = () => {
  const classes = useStyles();
  const [params, setParams] = useState<RouteSearchParams>({ date: new Date(), weeks: 4 });
  const [sorting, setSorting] = useState<Sorting>(sortingOptions[0]);
  const [results, setResults] = useState<RouteSearchResults | undefined>(initialResults);
  const [error, setError] = useState<Error | undefined>();
  const [action, setAction] = useState<{ callback?: () => void } | undefined>();
  const [visibility, setVisibility] = useState(false);
  const [searchInProgress, setSearchInProgress] = useState(false);

  useEffect(() => {
    if (!action) {
      return undefined;
    }

    if (!params.originPort || !params.destinationPort || !params.date || !params.weeks) {
      if (action && action.callback) {
        action.callback();
      }
      return undefined;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      setSearchInProgress(true);
      try {
        const search = querySting.stringify({
          origin: params.originPort!.ID,
          destination: params.destinationPort!.ID,
          date: formatDate(params.date, 'yyyy-MM-dd'),
          weeks: params.weeks.toString(),
          carrier: params.carrier,
        });
        const response = await fetch(`${process.env.REACT_APP_API_URL}/routes?${search}`, { signal });
        const body = await response.json();
        setResults(update('Routes', sorting.sort)(body as RouteSearchResults));
      } catch (e) {
        console.error('Failed to load routes', e);
        setError(e);
      } finally {
        if (action.callback) {
          action.callback();
        }
        setAction(undefined);
        setSearchInProgress(false);
      }
    })();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, action]);

  const handleFiltersChange = (carrier: string | undefined, callback: () => void) => {
    setParams(set('carrier', carrier)(params));
    setAction({ callback });
  };

  const handleSortingChange = (s: Sorting) => {
    setSorting(s);
    if (results) {
      setResults(update('Routes', sorting.sort)(results!));
    }
  };

  const handleVisibility = (isVisible: boolean) => {
    return isVisible ? '' : classes.hideSearch;
  };

  const handleStateChange = (status: any) => {
    if (status.status === Sticky.STATUS_FIXED) {
      setVisibility(true);
    } else {
      setVisibility(false);
    }
  };

  const DotAndLine: React.FC<DotProps> = ({ noLine }) => {
    const classes = useStyles();

    return (
      <div className={classes.dotAndLine}>
        <div className={classes.dot} />
        {!noLine && <div className={classes.line} />}
      </div>
    );
  };

  const createMarkup = (htmlMarkup: any) => {
    return { __html: htmlMarkup };
  };

  return (
    <Fragment>
      <Box className={classes.hero}>
        <Sticky enabled={true} top={8} innerZ={3} onStateChange={handleStateChange}>
          <Paper square className={handleVisibility(visibility)}>
            <Container>
              <RouteSearchBar
                value={params}
                onChange={setParams}
                onSearch={callback => setAction({ callback })}
                paperVisibility={handleVisibility(!visibility)}
              />
            </Container>
          </Paper>
        </Sticky>
      </Box>
      {error}
      {results ? (
        <Container>
          <Grid container spacing={4}>
            <Grid item md={3}>
              <Paper className={classes.sidebar}>
                <RouteSearchFilters value={params.carrier} onChange={handleFiltersChange} />
              </Paper>
            </Grid>
            <Grid item md={9}>
              <Paper className={classes.sorting}>
                <RouteSearchSorting value={sorting} onChange={handleSortingChange} />
              </Paper>
              {results.Routes.map((route, i) => (
                <ExpansionPanel>
                  <ExpansionPanelSummary
                    key={i}
                    className={classes.route}
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1c-content"
                  >
                    <Grid container spacing={2}>
                      <Grid item md={9} sm={12}>
                        <Typography variant="subtitle2" display="block" gutterBottom>
                          <Box fontWeight="fontWeightBold">Carrier</Box>
                        </Typography>
                        <Typography variant="h5" display="block" gutterBottom>
                          {route.OriginInfo.VoyageInfo.Carrier}
                        </Typography>
                      </Grid>
                      <Grid item md={3} sm={12}>
                        <Typography variant="subtitle2" display="block" gutterBottom>
                          <Box fontWeight="fontWeightBold">Space Availability</Box>
                        </Typography>
                        <Chip
                          label={route.SpaceInfo}
                          style={{ backgroundColor: route.SpaceInfoColor }}
                          className={classes.chip}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Divider light />
                      </Grid>

                      <Grid item md={3} sm={12}>
                        <Typography variant="subtitle2" display="block" gutterBottom>
                          <Box fontWeight="fontWeightBold">Departure</Box>
                        </Typography>
                        <Typography variant="body1" display="block">
                          ETS {formatDateString(route.OriginInfo.DepartureDate)}
                        </Typography>
                        <Typography variant="body2" display="block">
                          {route.OriginInfo.Port.HarbourName}, {route.OriginInfo.Port.Land}
                        </Typography>
                      </Grid>
                      <Grid item md={3} sm={12}>
                        <Typography variant="subtitle2" display="block" gutterBottom>
                          <Box fontWeight="fontWeightBold">Arrival</Box>
                        </Typography>
                        <Typography variant="body1" display="block">
                          ETA {formatDateString(route.DestinationInfo.ArrivalDate)}
                        </Typography>
                        <Typography variant="body2" display="block">
                          {route.DestinationInfo.Port.HarbourName}, {route.DestinationInfo.Port.Land}
                        </Typography>
                      </Grid>
                      <Grid item md={3} sm={6} xs={6}>
                        <Typography variant="subtitle2" display="block" gutterBottom>
                          <Box fontWeight="fontWeightBold">Transit Time</Box>
                        </Typography>
                        <Typography variant="body2" display="block" gutterBottom>
                          {route.TransitTime} days
                        </Typography>
                      </Grid>
                      <Grid item md={3} sm={6} xs={6}>
                        <Typography variant="subtitle2" display="block" gutterBottom>
                          <Box fontWeight="fontWeightBold">Routing</Box>
                        </Typography>
                        <Typography variant="body2" display="block" gutterBottom>
                          {route.Routing}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ExpansionPanelSummary>

                  <ExpansionPanelDetails>
                    <div className={classes.stepsWrapper}>
                      {route.OriginInfo && (
                        <div className={classes.routePoint}>
                          <DotAndLine noLine={false} />
                          <Box>
                            <Paper className={classes.paper}>
                              <Grid container spacing={3}>
                                <Grid item xs={12}>
                                  <Typography variant="h5" display="block">
                                    <Box fontWeight="fontWeightMedium">
                                      {formatDateString(route.OriginInfo.DepartureDate)}
                                    </Box>
                                  </Typography>
                                  <Typography variant="subtitle1" display="block" gutterBottom>
                                    {route.OriginInfo.Port.HarbourName}, {route.OriginInfo.Port.Land}
                                  </Typography>
                                </Grid>
                                <Grid item md={4} sm={12}>
                                  <Grid container spacing={2}>
                                    <Grid item>
                                      <DirectionsBoatIcon color="primary" />
                                    </Grid>
                                    <Grid>
                                      <Typography variant="subtitle2" display="block">
                                        <Box fontWeight="fontWeightBold">Vessel</Box>
                                      </Typography>
                                      <Typography variant="body2" display="block" gutterBottom>
                                        {route.OriginInfo.VoyageInfo.VesselName}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <Grid item md={8} sm={12}>
                                  <Grid container spacing={2}>
                                    <Grid item>
                                      <FlagIcon color="primary" />
                                    </Grid>
                                    <Grid>
                                      <Typography variant="subtitle2" display="block">
                                        <Box fontWeight="fontWeightBold">Delivery Address</Box>
                                      </Typography>
                                      <Typography variant="body1" display="block" gutterBottom>
                                        <div dangerouslySetInnerHTML={createMarkup(route.OriginInfo.Port.PortName)} />
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Box>
                        </div>
                      )}

                      {route.IntermediatePortInfos.map((intermediatePortInfo, i) => (
                        <div key={i} className={classes.routePoint}>
                          <DotAndLine noLine={false} />
                          <Box>
                            <Paper className={classes.paper}>
                              <Grid container spacing={3}>
                                <Grid item xs={12}>
                                  <Typography variant="h5" display="block">
                                    <Box fontWeight="fontWeightMedium">
                                      {formatDateString(intermediatePortInfo.DepartureDate)}
                                    </Box>
                                  </Typography>
                                  <Typography variant="subtitle1" display="block" gutterBottom>
                                    {intermediatePortInfo.Port.HarbourName}, {intermediatePortInfo.Port.Land}
                                  </Typography>
                                </Grid>
                                <Grid item md={4} sm={12}>
                                  <Grid container spacing={2}>
                                    <Grid item>
                                      <DirectionsBoatIcon color="primary" />
                                    </Grid>
                                    <Grid>
                                      <Typography variant="subtitle2" display="block">
                                        <Box fontWeight="fontWeightBold">Vessel</Box>
                                      </Typography>
                                      <Typography variant="body2" display="block" gutterBottom>
                                        {intermediatePortInfo.VoyageInfo.VesselName}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <Grid item md={8} sm={12}>
                                  <Grid container spacing={2}>
                                    <Grid item>
                                      <FlagIcon color="primary" />
                                    </Grid>
                                    <Grid>
                                      <Typography variant="subtitle2" display="block">
                                        <Box fontWeight="fontWeightBold">Delivery Address</Box>
                                      </Typography>
                                      <Typography variant="body1" display="block" gutterBottom>
                                        <div
                                          dangerouslySetInnerHTML={createMarkup(intermediatePortInfo.Port.PortName)}
                                        />
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Box>
                        </div>
                      ))}

                      {route.DestinationInfo && (
                        <div className={classes.routePoint}>
                          <DotAndLine noLine={true} />
                          <Box>
                            <Paper className={classes.paper}>
                              <Grid container spacing={3}>
                                <Grid item xs={12}>
                                  <Typography variant="h5" display="block">
                                    <Box fontWeight="fontWeightMedium">
                                      {formatDateString(route.DestinationInfo.ArrivalDate)}
                                    </Box>
                                  </Typography>
                                  <Typography variant="subtitle1" display="block" gutterBottom>
                                    {route.DestinationInfo.Port.HarbourName}, {route.DestinationInfo.Port.Land}
                                  </Typography>
                                </Grid>
                                <Grid item md={4} sm={12}>
                                  <Grid container spacing={2}>
                                    <Grid item>
                                      <DirectionsBoatIcon color="primary" />
                                    </Grid>
                                    <Grid>
                                      <Typography variant="subtitle2" display="block">
                                        <Box fontWeight="fontWeightBold">Vessel</Box>
                                      </Typography>
                                      <Typography variant="body2" display="block" gutterBottom>
                                        {route.DestinationInfo.VoyageInfo.VesselName}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <Grid item md={8} sm={12}>
                                  <Grid container spacing={2}>
                                    <Grid item>
                                      <FlagIcon color="primary" />
                                    </Grid>
                                    <Grid>
                                      <Typography variant="subtitle2" display="block">
                                        <Box fontWeight="fontWeightBold">Delivery Address</Box>
                                      </Typography>
                                      <Typography variant="body1" display="block" gutterBottom>
                                        <div
                                          dangerouslySetInnerHTML={createMarkup(route.DestinationInfo.Port.PortName)}
                                        />
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Box>
                        </div>
                      )}
                    </div>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              ))}
            </Grid>
          </Grid>
        </Container>
      ) : (
        searchInProgress && (
          <Container>
            <Grid container spacing={4}>
              <Grid item md={3}>
                <Skeleton className={classes.sidebar} variant="rect" width="100%" height={450} />
              </Grid>
              <Grid item md={9}>
                <Skeleton className={classes.sorting} variant="rect" width="100%" height={104} />
                <Skeleton className={classes.route} variant="rect" width="100%" height={232} />
                <Skeleton className={classes.route} variant="rect" width="100%" height={232} />
              </Grid>
            </Grid>
          </Container>
        )
      )}
    </Fragment>
  );
};

export default RouteSearch;
