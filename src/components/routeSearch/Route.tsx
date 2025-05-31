import React, { Fragment, useContext, useMemo, useState } from 'react';
import { renderToString } from 'react-dom/server';
import {
  Box,
  Button,
  Divider,
  ExpansionPanel,
  ExpansionPanelActions,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  IconButton,
  ListItemText,
  makeStyles,
  Popover,
  Theme,
  Typography,
  useTheme,
} from '@material-ui/core';
import formatDate from 'date-fns/format';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';

import CopyToClipboardIcon from '@material-ui/icons/FileCopyOutlined';
import Carriers from '../../contexts/Carriers';
import copyToClipboard, { ClipboardFormat } from '../../utilities/copyToClipboard';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { MenuItemLink } from '../Link';
import parseDate from 'date-fns/parse';
import { addDays, isValid } from 'date-fns';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import {
  RouteInfoBodyHTML,
  routeInfoBodyPlainText,
  routeInfoEmailBody,
} from './RouteBodyTextSharePrep';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import ListAltIcon from '@material-ui/icons/ListAlt';
import { DateFormats } from '../../utilities/formattingHelpers';
import RouteDeadlines from './RouteDeaadlines';
import RouteItinerary from './RouteItinerary';
import RouteSummary from './RouteSummary';
import BookNowButton from '../BookNowButton';
import useVesselWithVoyageById from '../../hooks/useVesselWithVoyageById';
import { getItineraryFromSchedule } from '../onlineBooking/Summary';

interface Props {
  route?: RouteSearchResult;
  isPicker?: boolean;
  handleBookNow?: (schedule?: RouteSearchResult) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.white,
  },
  deadlines: {
    marginBottom: theme.spacing(2),
  },
  stepper: {
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
  },
  popover: {
    margin: '1em',
  },
  carrierAvatar: {
    width: '.75em',
    height: '.75em',
    marginRight: theme.spacing(1),
  },
  scheduleDetailsActionButtonContainer: {
    display: 'flex',
    flexDirection: 'column-reverse',
  },
  actionBarGridItem: {
    marginRight: 0,
    textAlign: 'right',
  },
  expansionPanel: {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
}));

export const formatDateString = (date: string) =>
  isValid(new Date(date)) ? formatDate(new Date(date), DateFormats.LONG) : '-';

const Route: React.FC<Props> = ({ route, isPicker, handleBookNow }) => {
  const classes = useStyles();
  const theme = useTheme();
  const carriers = useContext(Carriers);
  const [expanded, setExpanded] = useState(false);
  const carrierName = route?.OriginInfo.VoyageInfo.Carrier.toLowerCase();
  const carrier = useMemo(
    () =>
      carriers?.find(carrier => carrier.name.toLowerCase() === carrierName) ||
      carriers?.find(carrier => carrier.id.toLowerCase() === carrierName),
    [carrierName, carriers],
  );
  const vesselWithVoyage = useMemo(() => {
    const routeItinerary = getItineraryFromSchedule(route);
    return (
      routeItinerary?.portOfLoading.VoyageInfo.VesselName +
      ' ' +
      routeItinerary?.portOfLoading.VoyageInfo.VoyageNr
    );
  }, [route]);
  const vesselAllocation = useVesselWithVoyageById(vesselWithVoyage);

  const disabled = !route;

  const expansionPanelStyle: React.CSSProperties = {
    backgroundColor: disabled ? theme.palette.background.paper : undefined,
  };

  const expansionPanelSummaryStyle: React.CSSProperties = {
    opacity: disabled ? 1 : undefined,
  };

  const prepareCopyBody = (route: RouteSearchResult) => {
    return [
      { body: renderToString(<RouteInfoBodyHTML route={route} />), format: ClipboardFormat.HTML },
      { body: routeInfoBodyPlainText(route), format: ClipboardFormat.PLAINTEXT },
    ];
  };

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [moreAnchorEl, setMoreAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleCopyToClipboardClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    copyToClipboard(prepareCopyBody(route!));

    setAnchorEl(event.currentTarget);
    setTimeout(handlePopoverClose, 1500);
  };

  const onMoreButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMoreAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMoreAnchorEl(null);
  };

  const buildMailToLink = (route: RouteSearchResult | undefined) => {
    if (route) {
      const mailtoAddress =
        import.meta.env.VITE_BRAND === 'brunoni'
          ? 'mailto:platform@mybrunoni.ch'
          : 'mailto:platform@myallmarine.ch';
      return (
        mailtoAddress +
        '?'.concat(
          [
            'subject=' +
              encodeURI(
                'Request booking - ' +
                  carrier?.name +
                  ' - ' +
                  route.OriginInfo.Port.HarbourName +
                  ' → ' +
                  route.DestinationInfo.Port.HarbourName,
              ),
            'body=' + encodeURI(routeInfoEmailBody(route)),
          ].join('&'),
        )
      );
    } else return 'mailto:platform@mybrunoni.ch';
  };

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  const popoverOpen = Boolean(anchorEl);
  const popoverId = popoverOpen ? 'simple-popover' : undefined;

  return (
    <Box mb={2}>
      <ExpansionPanel
        TransitionProps={{ unmountOnExit: true }}
        disabled={disabled}
        style={expansionPanelStyle}
        expanded={expanded}
      >
        <ExpansionPanelSummary
          aria-controls="panel1c-content"
          style={expansionPanelSummaryStyle}
          expandIcon={null}
          onClick={toggleExpansion}
          className={classes.expansionPanel}
        >
          <Grid container spacing={2}>
            <Grid item xs={10}>
              {route && (
                <RouteSummary
                  route={route}
                  carrier={carrier}
                  isFullyBooked={vesselAllocation?.isFullyBooked}
                />
              )}
            </Grid>
            <Grid item xs={2} className={classes.actionBarGridItem}>
              <Box
                alignContent="right"
                display="flex"
                justifyContent="space-between"
                flexDirection="column"
                height="100%"
              >
                <Box>
                  {route &&
                    parseDate(route.OriginInfo.DepartureDate, 'yyyy-MM-dd', new Date()) >
                      addDays(new Date(), 4) &&
                    (isPicker && handleBookNow ? (
                      <BookNowButton bookNow={() => handleBookNow(route)} />
                    ) : (
                      <Fragment>
                        <IconButton aria-label="actions" onClick={onMoreButtonClick}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          id="actions"
                          anchorEl={moreAnchorEl}
                          keepMounted
                          open={Boolean(moreAnchorEl)}
                          onClose={handleClose}
                        >
                          {handleBookNow ? (
                            <MenuItem onClick={() => handleBookNow(route)}>
                              <ListItemIcon>
                                <DirectionsBoatIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary="Book Now" />
                            </MenuItem>
                          ) : (
                            <MenuItem component="a" href={buildMailToLink(route)} target="_blank">
                              <ListItemIcon>
                                <DirectionsBoatIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary="Book Now" />
                            </MenuItem>
                          )}
                          <MenuItemLink to="/quotes/get">
                            <ListItemIcon>
                              <ListAltIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Request Quote" />
                          </MenuItemLink>
                          <MenuItem
                            component={Button}
                            onClick={handleCopyToClipboardClick}
                            style={{ width: '100%', textTransform: 'none' }}
                          >
                            <ListItemIcon>
                              <CopyToClipboardIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Copy Data" />
                            <Popover
                              id={popoverId}
                              open={popoverOpen}
                              anchorEl={anchorEl}
                              onClose={handlePopoverClose}
                              anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                              }}
                              transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                              }}
                            >
                              <Typography className={classes.popover}>
                                Schedule info copied to clipboard.
                              </Typography>
                            </Popover>
                          </MenuItem>
                        </Menu>
                      </Fragment>
                    ))}
                </Box>

                <Box>
                  <IconButton onClick={toggleExpansion}>
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </ExpansionPanelSummary>

        {route && (
          <Fragment>
            <ExpansionPanelDetails className={classes.expansionPanel}>
              <Grid container>
                <Grid item container xs={12} spacing={2} className={classes.deadlines}>
                  <RouteDeadlines route={route} />
                </Grid>
                <Grid item xs={12}>
                  <RouteItinerary route={route} />
                </Grid>
              </Grid>
            </ExpansionPanelDetails>
            <ExpansionPanelActions>
              <Grid container>
                <Grid item xs={12}>
                  <Box p={2}>
                    <Typography variant="subtitle2">
                      <Box paddingBottom={1}>SERVICE {route!.Service}</Box>
                    </Typography>
                    <Divider light />
                    <Typography variant="body2">
                      <Box paddingTop={1} component="span">
                        ALL ETS/ETA DATES, PORTS AND ROTATIONS ARE GIVEN FOR INFORMATION ONLY AND
                        ARE NOT LEGALLY BINDING. ALL DATA IS SUBJECT TO ALTERATION WITHOUT NOTICE.
                      </Box>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </ExpansionPanelActions>
          </Fragment>
        )}
      </ExpansionPanel>
    </Box>
  );
};

export default Route;
