import React from 'react';
import formatDate from 'date-fns/format';
import { Box, Grid, makeStyles, Theme } from '@material-ui/core';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import DirectionsPortIcon from '@material-ui/icons/PinDrop';
import FlagIcon from '@material-ui/icons/Flag';
import { ItineraryItem as ItineraryItemModel, SearchResultsPort } from '../model/route-search/RouteSearchResults';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import InfoBoxItem from './InfoBoxItem';
import { DateFormats } from '../utilities/formattingHelpers';

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
  label: {
    marginBottom: '.25em',
  },
  icon: {
    marginRight: '.25em',
  },
}));

interface Props {
  itineraryItem: ItineraryItemModel;
  noLine: boolean;
}

const formatDateString = (date: string) => formatDate(new Date(date), DateFormats.SHORT_HUMAN);

export const isIntermediary = (itineraryItem: ItineraryItemModel) =>
  itineraryItem.ArrivalDate && itineraryItem.DepartureDate;

const createMarkup = (port: SearchResultsPort) => ({
  __html: port.PortName ? port.PortName : `${port.HarbourName}<br/>${port.Land}`,
});

const ItineraryItem: React.FC<Props> = ({ itineraryItem, noLine, ...rest }) => {
  const classes = useStyles();

  return (
    <Step {...rest} active={true}>
      <StepLabel>
        <Box fontWeight="fontWeightBold">
          {isIntermediary(itineraryItem)
            ? `${formatDateString(itineraryItem.ArrivalDate!)} - ${formatDateString(itineraryItem.DepartureDate!)}`
            : itineraryItem.DepartureDate
            ? formatDateString(itineraryItem.DepartureDate!)
            : formatDateString(itineraryItem.ArrivalDate!)}
          <div>
            {itineraryItem.Port.HarbourName}, {itineraryItem.Port.Land}
          </div>
        </Box>
      </StepLabel>
      <StepContent className={classes.stepContent}>
        <Grid container spacing={3}>
          <Grid item md={3} sm={12}>
            <InfoBoxItem
              IconComponent={DirectionsBoatIcon}
              title="Vessel"
              label1={itineraryItem.VoyageInfo.VesselName}
              label2={itineraryItem.VoyageInfo.VoyageNr}
              gutterBottom
            />
          </Grid>
          <Grid item md={3} sm={12}>
            <InfoBoxItem
              IconComponent={DirectionsPortIcon}
              title="Port"
              label1={itineraryItem.Port.HarbourName}
              label2={itineraryItem.Port.Land}
              gutterBottom
            />
          </Grid>
          {!isIntermediary(itineraryItem) && (
            <Grid item md={6} sm={12}>
              <InfoBoxItem
                IconComponent={FlagIcon}
                title={itineraryItem.DepartureDate ? 'Origin Terminal' : 'Destination Terminal'}
                label1HTML={createMarkup(itineraryItem.Port)}
              />
              {/*<span dangerouslySetInnerHTML={createMarkup(itineraryItem.Port.PortName)}/>*/}
            </Grid>
          )}
        </Grid>
      </StepContent>
    </Step>
  );
};

export default ItineraryItem;
