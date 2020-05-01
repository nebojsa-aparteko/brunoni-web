import React, { Fragment, useContext, useMemo, useState } from 'react';
import { renderToString } from 'react-dom/server';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  ExpansionPanel,
  ExpansionPanelActions,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  IconButton,
  makeStyles,
  Popover,
  Theme,
  Typography,
  useTheme,
  ListItemText,
} from '@material-ui/core';
import formatDate from 'date-fns/format';
import ItineraryItem from '../ItineraryItem';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import Stepper from '@material-ui/core/Stepper';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import WavesIcon from '@material-ui/icons/Waves';
import InfoBoxItem from '../InfoBoxItem';
import TextSkeleton from '../TextSkeleton';

import CopyToClipboardIcon from '@material-ui/icons/FileCopyOutlined';
import Carriers from '../../contexts/Carriers';
import { Skeleton } from '@material-ui/lab';
import ShareIcon from '@material-ui/icons/Share';
import copyToClipboard, { ClipboardFormat } from '../../utilities/copyToClipboard';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Link as RouterLink } from 'react-router-dom';
import parseDate from 'date-fns/parse';
import { addDays } from 'date-fns';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { RouteInfoBodyHTML, routeInfoBodyPlainText, routeInfoEmailBody } from './RouteBodyTextSharePrep';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import ListAltIcon from '@material-ui/icons/ListAlt';
import { DateFormats } from '../../utilities/formattingHelpers';

interface Props {
  route?: RouteSearchResult;
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

const formatDateString = (date: string) => formatDate(new Date(date), DateFormats.LONG);

const Route: React.FC<Props> = ({ route }) => {
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
        process.env.REACT_APP_BRAND === 'brunoni' ? 'mailto:platform@mybrunoni.ch' : 'mailto:platform@myallmarine.ch';
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
              <Grid container spacing={2}>
                <Grid item md={6} xs={12}>
                  <Typography variant="subtitle2" display="block" gutterBottom>
                    <Box fontWeight="fontWeightBold">Carrier</Box>
                  </Typography>
                  <Typography variant="h5" display="block">
                    <Box display="flex" alignItems="center" lineHeight="normal">
                      {carrier ? (
                        <Fragment>
                          <Avatar className={classes.carrierAvatar} style={{ backgroundColor: carrier!.color }} />
                          <span>{carrier.name.toUpperCase()}</span>
                        </Fragment>
                      ) : route ? (
                        <Fragment>
                          <Skeleton variant="circle" className={classes.carrierAvatar} />
                          <span>{route!.OriginInfo.VoyageInfo.Carrier}</span>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <Skeleton variant="circle" className={classes.carrierAvatar} />
                          <TextSkeleton width={[60, 90]} />
                        </Fragment>
                      )}
                    </Box>
                  </Typography>
                </Grid>
                <Grid item md={3} xs={12}>
                  <InfoBoxItem
                    title="Vessel"
                    label1={route?.OriginInfo.VoyageInfo.VesselName}
                    label2={route?.OriginInfo.VoyageInfo.VoyageNr}
                    gutterBottom
                  />
                </Grid>
                {route?.SpaceInfo && (
                  <Grid item md={3} xs={12}>
                    <Typography variant="subtitle2" display="block" gutterBottom>
                      <Box fontWeight="fontWeightBold">Space Availability</Box>
                    </Typography>
                    <Chip
                      size="small"
                      label={route?.SpaceInfo}
                      style={{ backgroundColor: route?.SpaceInfoColor }}
                      className={classes.chip}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item md={3} sm={12} xs={12}>
                  <InfoBoxItem
                    IconComponent={ChevronRightIcon}
                    title="Departure"
                    label1={
                      route ? (
                        `
  ETS ${formatDateString(route!.OriginInfo.DepartureDate)}`
                      ) : (
                        <TextSkeleton width={100} />
                      )
                    }
                    label2={
                      route ? (
                        `${route!.OriginInfo.Port.HarbourName}, ${route!.OriginInfo.Port.Land}`
                      ) : (
                        <TextSkeleton width={[80, 120]} />
                      )
                    }
                  />
                </Grid>
                <Grid item md={3} sm={12} xs={12}>
                  <InfoBoxItem
                    IconComponent={LastPageIcon}
                    title="Arrival"
                    label1={
                      route ? (
                        `
  ETA ${formatDateString(route!.DestinationInfo.ArrivalDate)}`
                      ) : (
                        <TextSkeleton width={100} />
                      )
                    }
                    label2={
                      route ? (
                        `${route!.DestinationInfo.Port.HarbourName}, ${route!.DestinationInfo.Port.Land}`
                      ) : (
                        <TextSkeleton width={[80, 120]} />
                      )
                    }
                  />
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                  <InfoBoxItem
                    IconComponent={WavesIcon}
                    title="Transit Time"
                    label1={
                      route ? (
                        `${route!.TransitTime}
  DAYS`
                      ) : (
                        <TextSkeleton width={70} />
                      )
                    }
                  />
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                  <InfoBoxItem
                    IconComponent={ShareIcon}
                    title="Routing"
                    label1={route ? route!.Routing : <TextSkeleton width={[50, 80]} />}
                  />
                </Grid>
              </Grid>
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
                    parseDate(route.OriginInfo.DepartureDate, 'yyyy-MM-dd', new Date()) > addDays(new Date(), 4) && (
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
                          <MenuItem component="a" href={buildMailToLink(route)} target="_blank">
                            <ListItemIcon>
                              <DirectionsBoatIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Book Now" />
                          </MenuItem>
                          <MenuItem component={RouterLink} to={`/quotes/get`}>
                            <ListItemIcon>
                              <ListAltIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Request Quote" />
                          </MenuItem>
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
                              <Typography className={classes.popover}>Schedule info copied to clipboard.</Typography>
                            </Popover>
                          </MenuItem>
                        </Menu>
                      </Fragment>
                    )}
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
              {/* Deadlines Display */}
              <Grid container>
                <Grid item container xs={12} spacing={2} className={classes.deadlines}>
                  {route!.Deadlines.map((deadline, i) => (
                    <Grid key={i} item md={4} sm={4}>
                      <InfoBoxItem
                        title={`${deadline.Typ}
  closing`}
                        label1={deadline.Time}
                      />
                    </Grid>
                  ))}
                </Grid>
                {/* Itinerary */}
                <Grid item xs={12}>
                  <Stepper orientation="vertical" className={classes.stepper}>
                    {route!.OriginInfo && <ItineraryItem noLine={false} itineraryItem={route!.OriginInfo} />}
                    {route!.IntermediatePortInfos.map((intermediatePortInfo, i) => (
                      <ItineraryItem key={i} noLine={false} itineraryItem={intermediatePortInfo} />
                    ))}
                    {route!.DestinationInfo && <ItineraryItem noLine={true} itineraryItem={route!.DestinationInfo} />}
                  </Stepper>
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
                        ALL ETS/ETA DATES, PORTS AND ROTATIONS ARE GIVEN FOR INFORMATION ONLY AND ARE NOT LEGALLY
                        BINDING. ALL DATA IS SUBJECT TO ALTERATION WITHOUT NOTICE.
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
