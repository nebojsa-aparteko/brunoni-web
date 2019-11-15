import React from 'react';
import formatDate from 'date-fns/format';
import { Theme, Typography, makeStyles, Box, Paper, Grid } from '@material-ui/core';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import DirectionsPortIcon from '@material-ui/icons/PinDrop';
import FlagIcon from '@material-ui/icons/Flag';
import DotAndLine from './DotAndLine';
import {
  RouteSearchResultDestinationInfo,
  RouteSearchResultIntermediatePortInfo,
  RouteSearchResultOriginInfo,
} from '../model/route-search/RouteSearchResults';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  routePoint: {
    padding: theme.spacing(2, 0),
    position: 'relative',
  },
  paper: {
    padding: theme.spacing(4),
    paddingLeft: '6em',
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  itineraryItem: RouteSearchResultOriginInfo | RouteSearchResultIntermediatePortInfo | RouteSearchResultDestinationInfo;
  noLine: boolean;
}

const formatDateString = (date: string) => formatDate(new Date(date), 'd. MMMM');

const isIntermediary = (
  itineraryItem: RouteSearchResultOriginInfo | RouteSearchResultIntermediatePortInfo | RouteSearchResultDestinationInfo,
) => {
  return (
    (itineraryItem as RouteSearchResultIntermediatePortInfo).ArrivalDate &&
    (itineraryItem as RouteSearchResultIntermediatePortInfo).DepartureDate
  );
};

const createMarkup = (htmlMarkup: any) => {
  return { __html: htmlMarkup };
};

const ItineraryItem: React.FC<Props> = ({ itineraryItem, noLine }) => {
  const classes = useStyles();

  return (
    <div className={classes.routePoint}>
      <DotAndLine noLine={noLine} />
      <Box>
        <Paper className={classes.paper}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" display="block">
                <Box fontWeight="fontWeightMedium">
                  {isIntermediary(itineraryItem)
                    ? `${formatDateString(
                        (itineraryItem as RouteSearchResultIntermediatePortInfo).ArrivalDate,
                      )} - ${formatDateString((itineraryItem as RouteSearchResultIntermediatePortInfo).DepartureDate)}`
                    : (itineraryItem as RouteSearchResultOriginInfo).DepartureDate
                    ? formatDateString((itineraryItem as RouteSearchResultOriginInfo).DepartureDate)
                    : formatDateString((itineraryItem as RouteSearchResultDestinationInfo).ArrivalDate)}
                </Box>
              </Typography>
              <Typography variant="subtitle1" display="block" gutterBottom>
                {itineraryItem.Port.HarbourName}, {itineraryItem.Port.Land}
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
                    {itineraryItem.VoyageInfo.VesselName}
                  </Typography>
                  <Typography variant="body2" display="block" gutterBottom>
                    {itineraryItem.VoyageInfo.VoyageNr}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item md={4} sm={12}>
              <Grid container spacing={2}>
                <Grid item>
                  <DirectionsPortIcon color="primary" />
                </Grid>
                <Grid>
                  <Typography variant="subtitle2" display="block">
                    <Box fontWeight="fontWeightBold">Port</Box>
                  </Typography>
                  <Typography variant="body2" display="block" gutterBottom>
                    {itineraryItem.Port.HarbourName}
                  </Typography>
                  <Typography variant="body2" display="block" gutterBottom>
                    {itineraryItem.Port.Land}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            {!isIntermediary(itineraryItem) && (
              <Grid item md={4} sm={12}>
                <Grid container spacing={2}>
                  <Grid item>
                    <FlagIcon color="primary" />
                  </Grid>
                  <Grid>
                    <Typography variant="subtitle2" display="block">
                      <Box fontWeight="fontWeightBold">Delivery Address</Box>
                    </Typography>
                    <Typography variant="body1" display="block" gutterBottom>
                      <span dangerouslySetInnerHTML={createMarkup(itineraryItem.Port.PortName)} />
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </div>
  );
};

export default ItineraryItem;
