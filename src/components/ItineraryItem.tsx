import React from 'react';
import formatDate from 'date-fns/format';
import { Theme, Typography, makeStyles, Box, Paper, Grid } from '@material-ui/core';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import DirectionsPortIcon from '@material-ui/icons/PinDrop';
import FlagIcon from '@material-ui/icons/Flag';
import DotAndLine from './DotAndLine';
import { ItineraryItem as ItineraryItemModel } from '../model/route-search/RouteSearchResults';

const useStyles = makeStyles((theme: Theme) => ({
  routePoint: {
    position: 'relative',
  },
  paper: {
    padding: theme.spacing(4),
    paddingLeft: '6em',
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  itineraryItem: ItineraryItemModel;
  noLine: boolean;
}

const formatDateString = (date: string) => formatDate(new Date(date), 'd. MMMM');

const isIntermediary = (itineraryItem: ItineraryItemModel) => itineraryItem.ArrivalDate && itineraryItem.DepartureDate;

const createMarkup = (htmlMarkup: any) => ({ __html: htmlMarkup });

const ItineraryItem: React.FC<Props> = ({ itineraryItem, noLine }) => {
  const classes = useStyles();

  return (
    <Box className={classes.routePoint} p={1}>
      <DotAndLine noLine={noLine} />
      <Box>
        <Paper className={classes.paper}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" display="block">
                <Box fontWeight="fontWeightMedium">
                  {isIntermediary(itineraryItem)
                    ? `${formatDateString(itineraryItem.ArrivalDate!)} - ${formatDateString(
                        itineraryItem.DepartureDate!,
                      )}`
                    : itineraryItem.DepartureDate
                    ? formatDateString(itineraryItem.DepartureDate!)
                    : formatDateString(itineraryItem.ArrivalDate!)}
                </Box>
              </Typography>
              <Typography variant="subtitle1" display="block" gutterBottom>
                {itineraryItem.Port.HarbourName}, {itineraryItem.Port.Land}
              </Typography>
            </Grid>
            <Grid item md={4} sm={12}>
              <Grid container spacing={2} wrap="nowrap">
                <Grid item>
                  <DirectionsBoatIcon color="primary" />
                </Grid>
                <Grid item>
                  <Typography variant="subtitle2" display="block">
                    <Box fontWeight="fontWeightBold">Vessel</Box>
                  </Typography>
                  <Typography variant="body2" display="block">
                    {itineraryItem.VoyageInfo.VesselName}
                  </Typography>
                  <Typography variant="body2" display="block" gutterBottom>
                    {itineraryItem.VoyageInfo.VoyageNr}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item md={3} sm={12}>
              <Grid container spacing={2} wrap="nowrap">
                <Grid item>
                  <DirectionsPortIcon color="primary" />
                </Grid>
                <Grid item>
                  <Typography variant="subtitle2" display="block">
                    <Box fontWeight="fontWeightBold">Port</Box>
                  </Typography>
                  <Typography variant="body2" display="block">
                    {itineraryItem.Port.HarbourName}
                  </Typography>
                  <Typography variant="body2" display="block" gutterBottom>
                    {itineraryItem.Port.Land}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            {!isIntermediary(itineraryItem) && (
              <Grid item md={5} sm={12}>
                <Grid container spacing={2} wrap="nowrap">
                  <Grid item>
                    <FlagIcon color="primary" />
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle2" display="block">
                      <Box fontWeight="fontWeightBold">Receiving Address</Box>
                    </Typography>
                    <Typography variant="body2" display="block">
                      <span dangerouslySetInnerHTML={createMarkup(itineraryItem.Port.PortName)} />
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default ItineraryItem;
