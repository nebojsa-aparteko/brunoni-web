import React from 'react';
import formatDate from 'date-fns/format';
import { Theme, Typography, makeStyles, Box, Grid } from '@material-ui/core';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import DirectionsPortIcon from '@material-ui/icons/PinDrop';
import FlagIcon from '@material-ui/icons/Flag';
import { ItineraryItem as ItineraryItemModel } from '../model/route-search/RouteSearchResults';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';

const useStyles = makeStyles((theme: Theme) => ({
  routePoint: {
    position: 'relative',
  },
  paper: {
    padding: theme.spacing(4),
    paddingLeft: '6em',
    marginBottom: theme.spacing(2),
  },
  stepContent: {
    paddingTop: theme.spacing(1),
  },
}));

interface Props {
  itineraryItem: ItineraryItemModel;
  noLine: boolean;
}

const formatDateString = (date: string) => formatDate(new Date(date), 'd. MMMM');

const isIntermediary = (itineraryItem: ItineraryItemModel) => itineraryItem.ArrivalDate && itineraryItem.DepartureDate;

const createMarkup = (htmlMarkup: any) => ({ __html: htmlMarkup });

const ItineraryItem: React.FC<Props> = ({ itineraryItem, noLine, ...rest }) => {
  const classes = useStyles();

  return (
    <Step {...rest} active={true}>
      <StepLabel>
        {isIntermediary(itineraryItem)
          ? `${formatDateString(itineraryItem.ArrivalDate!)} - ${formatDateString(itineraryItem.DepartureDate!)}`
          : itineraryItem.DepartureDate
          ? formatDateString(itineraryItem.DepartureDate!)
          : formatDateString(itineraryItem.ArrivalDate!)}
        <div>
          {itineraryItem.Port.HarbourName}, {itineraryItem.Port.Land}
        </div>
      </StepLabel>
      <StepContent className={classes.stepContent}>
        <Grid container spacing={3}>
          <Grid item md={3} sm={12}>
            <Grid container>
              <Grid item xs={12}>
                <Grid container direction="row" alignItems="center">
                  {/*<Grid item>*/}
                  {/*  <DirectionsBoatIcon color="primary" />*/}
                  {/*</Grid>*/}
                  <Grid item>
                    <Typography variant="subtitle2" display="inline">
                      <Box fontWeight="fontWeightBold">Vessel</Box>
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
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
            <Grid container>
              <Grid item xs={12}>
                <Grid container direction="row" alignItems="center">
                  {/*<Grid item>*/}
                  {/*  <DirectionsPortIcon color="primary" />*/}
                  {/*</Grid>*/}
                  <Grid item>
                    <Typography variant="subtitle2" display="inline">
                      <Box fontWeight="fontWeightBold">Port</Box>
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
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
            <Grid item md={6} sm={12}>
              <Grid container>
                <Grid item xs={12}>
                  <Grid container direction="row" alignItems="center">
                    {/*<Grid item>*/}
                    {/*  <FlagIcon color="primary" />*/}
                    {/*</Grid>*/}
                    <Grid item>
                      <Typography variant="subtitle2" display="inline">
                        <Box fontWeight="fontWeightBold">Receiving Address</Box>
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" display="block">
                    <span dangerouslySetInnerHTML={createMarkup(itineraryItem.Port.PortName)} />
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </StepContent>
    </Step>
  );
};

export default ItineraryItem;
