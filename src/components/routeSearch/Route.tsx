import React from 'react';
import {
  Theme,
  makeStyles,
  ExpansionPanel,
  ExpansionPanelSummary,
  Grid,
  Box,
  Divider,
  ExpansionPanelDetails,
  ExpansionPanelActions,
  Typography,
  Chip,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import formatDate from 'date-fns/format';
import ItineraryItem from '../ItineraryItem';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import Stepper from '@material-ui/core/Stepper';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import WavesIcon from '@material-ui/icons/Waves';
import InfoBoxItem from '../InfoBoxItem';

interface Props {
  route: RouteSearchResult;
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
}));

const formatDateString = (date: string) => formatDate(new Date(date), 'd. MMMM');

const Route: React.FC<Props> = ({ route }) => {
  const classes = useStyles();

  return (
    <Box>
      <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1c-content">
          <Grid container spacing={2}>
            <Grid item md={9} sm={12}>
              <Typography variant="subtitle2" display="block">
                <Box fontWeight="fontWeightBold">Carrier</Box>
              </Typography>
              <Typography variant="h6" display="block">
                {route.OriginInfo.VoyageInfo.Carrier}
              </Typography>
            </Grid>
            {route.SpaceInfo && (
              <Grid item md={3} sm={12}>
                <Typography variant="subtitle2" display="block" gutterBottom>
                  <Box fontWeight="fontWeightBold">Space Availability</Box>
                </Typography>
                <Chip
                  size="small"
                  label={route.SpaceInfo}
                  style={{ backgroundColor: route.SpaceInfoColor }}
                  className={classes.chip}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider light />
            </Grid>

            <Grid item md={3} sm={12}>
              <InfoBoxItem
                IconComponent={ChevronRightIcon}
                title="Departure"
                label1={`ETS ${formatDateString(route.OriginInfo.DepartureDate)}`}
                label2={`${route.OriginInfo.Port.city}, ${route.OriginInfo.Port.country}`}
              />
            </Grid>
            <Grid item md={3} sm={12}>
              <InfoBoxItem
                IconComponent={LastPageIcon}
                title="Arrival"
                label1={`ETA ${formatDateString(route.DestinationInfo.ArrivalDate)}`}
                label2={`${route.DestinationInfo.Port.city}, ${route.DestinationInfo.Port.country}`}
              />
            </Grid>
            <Grid item md={3} sm={6} xs={6}>
              <InfoBoxItem IconComponent={WavesIcon} title="TransitTime" label1={`${route.TransitTime} DAYS`} />
            </Grid>
            <Grid item md={3} sm={6} xs={6}>
              <InfoBoxItem IconComponent={WavesIcon} title="Routing" label1={route.Routing} />
            </Grid>
          </Grid>
        </ExpansionPanelSummary>

        <ExpansionPanelDetails>
          {/* Deadlines Display */}

          <Grid container>
            <Grid item container xs={12} spacing={2} className={classes.deadlines}>
              {route.Deadlines.map((deadline, i) => (
                <Grid key={i} item md={3} sm={3}>
                  <InfoBoxItem title={`${deadline.Typ} closing`} label1={deadline.Time} />
                </Grid>
              ))}
            </Grid>

            {/* Itinerary */}

            <Grid item xs={12}>
              <Stepper orientation="vertical" className={classes.stepper}>
                {route.OriginInfo && <ItineraryItem noLine={false} itineraryItem={route.OriginInfo} />}
                {route.IntermediatePortInfos.map((intermediatePortInfo, i) => (
                  <ItineraryItem key={i} noLine={false} itineraryItem={intermediatePortInfo} />
                ))}
                {route.DestinationInfo && <ItineraryItem noLine={true} itineraryItem={route.DestinationInfo} />}
              </Stepper>
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
        <ExpansionPanelActions>
          <Grid container>
            <Grid item>
              <Box p={2}>
                <Typography variant="subtitle2">
                  <Box paddingBottom={1}>SERVICE {route.Service}</Box>
                </Typography>
                <Divider light />
                <Typography variant="body2">
                  <Box paddingTop={1} component="span">
                    ALL ETS/ETA DATES, PORTS AND ROTATIONS ARE GIVEN FOR INFORMATION ONLY AND ARE NOT LEGALLY BINDING.
                    ALL DATA IS SUBJECT TO ALTERATION WITHOUT NOTICE.
                  </Box>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </ExpansionPanelActions>
      </ExpansionPanel>
    </Box>
  );
};

export default Route;
