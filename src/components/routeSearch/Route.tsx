import React, { Fragment, useContext, useMemo } from 'react';
import { renderToString } from 'react-dom/server';
import {
  Avatar,
  Box,
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
}));

const paragraphStyles = {
  fontFamily: 'Calibri, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSize: '11pt',
};

const formatDateString = (date: string) => formatDate(new Date(date), 'dd.MM.yyyy');

const ClipboardCopyBody: React.FC<{ route: RouteSearchResult }> = ({ route }) => {
  return (
    <Fragment>
      <p style={paragraphStyles}>
        {route.OriginInfo.VoyageInfo.VesselName} {route.OriginInfo.VoyageInfo.VoyageNr} <br />
        {route.OriginInfo.Port.HarbourName}, {route.OriginInfo.Port.Land} ETS
        {formatDateString(route.OriginInfo.DepartureDate)}
        <br />
        {route.DestinationInfo.Port.HarbourName}, {route.DestinationInfo.Port.Land} ETA
        {formatDateString(route.DestinationInfo.ArrivalDate)}
        <br />
      </p>
      <p style={paragraphStyles}>
        {route.Deadlines.flatMap(deadline => (
          <Fragment>
            {deadline.Typ} closing - {deadline.Time}
            <br />
          </Fragment>
        ))}
      </p>
      <p style={paragraphStyles}>
        Origin Address:
        <br />
        <span dangerouslySetInnerHTML={{ __html: route.OriginInfo.Port.PortName }} />
      </p>
      <p style={paragraphStyles}>
        Destination Address:
        <br />
        <span dangerouslySetInnerHTML={{ __html: route.DestinationInfo.Port.PortName }} />
      </p>
      <p style={paragraphStyles}>
        Source:{' '}
        {process.env.REACT_APP_BRAND === 'brunoni' ? (
          <a href="https://mybrunoni.ch">mybrunoni.ch</a>
        ) : (
          <a href="https://myallmarine.ch">myallmarine.ch</a>
        )}
      </p>
    </Fragment>
  );
};

const Route: React.FC<Props> = ({ route }) => {
  const classes = useStyles();
  const theme = useTheme();
  const carriers = useContext(Carriers);
  const carrierName = route?.OriginInfo.VoyageInfo.Carrier.toLowerCase();
  const carrier = useMemo(() => carriers?.find(carrier => carrier.name.toLowerCase() === carrierName), [
    carrierName,
    carriers,
  ]);

  const disabled = !route;

  const expansionPanelStyle: React.CSSProperties = {
    backgroundColor: disabled ? theme.palette.background.paper : undefined,
  };

  const expansionPanelSummaryStyle: React.CSSProperties = {
    opacity: disabled ? 1 : undefined,
  };

  const prepareCopyBody = (route: RouteSearchResult) => {
    const plainTextOutput = `
${route.OriginInfo.VoyageInfo.VesselName} ${route.OriginInfo.VoyageInfo.VoyageNr}
${route.OriginInfo.Port.HarbourName}, ${route.OriginInfo.Port.Land} ETS ${formatDateString(
      route.OriginInfo.DepartureDate,
    )}
${route.DestinationInfo.Port.HarbourName}, ${route.DestinationInfo.Port.Land} ETA ${formatDateString(
      route.DestinationInfo.ArrivalDate,
    )}

${route.Deadlines.flatMap(deadline => {
  return `${deadline.Typ} closing - ${deadline.Time}`;
})
  .toString()
  .split(',')
  .join('\n')}

Origin Address:
${route.OriginInfo.Port.PortName.split('<br/> ').join('\n')}

Destination Address:
${route.DestinationInfo.Port.PortName.split('<br/> ').join('\n')}

Source: ${process.env.REACT_APP_BRAND === 'brunoni' ? 'https://mybrunoni.ch' : 'https://myallmarine.ch'}
    `;
    return [
      { body: renderToString(<ClipboardCopyBody route={route} />), format: ClipboardFormat.HTML },
      { body: plainTextOutput, format: ClipboardFormat.PLAINTEXT },
    ];
  };

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleCopyToClipboardClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    copyToClipboard(prepareCopyBody(route!));

    setAnchorEl(event.currentTarget);
    setTimeout(handlePopoverClose, 1500);
  };

  const popoverOpen = Boolean(anchorEl);
  const popoverId = popoverOpen ? 'simple-popover' : undefined;

  return (
    <Box>
      <ExpansionPanel TransitionProps={{ unmountOnExit: true }} disabled={disabled} style={expansionPanelStyle}>
        <ExpansionPanelSummary aria-controls="panel1c-content" style={expansionPanelSummaryStyle}>
          <Grid container spacing={2}>
            <Grid item md={6} sm={12}>
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
            <Grid item md={3} sm={12}>
              <InfoBoxItem
                title="Vessel"
                label1={route!.OriginInfo.VoyageInfo.VesselName}
                label2={route!.OriginInfo.VoyageInfo.VoyageNr}
                gutterBottom
              />
            </Grid>
            {route?.SpaceInfo && (
              <Grid item md={3} sm={12}>
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

            <Grid item md={3} sm={12}>
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
            <Grid item md={3} sm={12}>
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
            <Grid item md={3} sm={6} xs={6}>
              <InfoBoxItem
                IconComponent={WavesIcon}
                title="TransitTime"
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
            <Grid item md={3} sm={6} xs={6}>
              <InfoBoxItem
                IconComponent={ShareIcon}
                title="Routing"
                label1={route ? route!.Routing : <TextSkeleton width={[50, 80]} />}
              />
            </Grid>
          </Grid>
        </ExpansionPanelSummary>

        {route && (
          <Fragment>
            <ExpansionPanelDetails>
              {/* Deadlines Display */}
              <Grid container>
                <Grid item container xs={12} spacing={2} className={classes.deadlines}>
                  {route!.Deadlines.map((deadline, i) => (
                    <Grid key={i} item md={3} sm={3}>
                      <InfoBoxItem
                        title={`${deadline.Typ}
  closing`}
                        label1={deadline.Time}
                      />
                    </Grid>
                  ))}
                  <Grid item md={3} sm={3}>
                    <IconButton aria-label="delete" onClick={handleCopyToClipboardClick}>
                      <CopyToClipboardIcon />
                    </IconButton>
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
                  </Grid>
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
                <Grid item>
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
