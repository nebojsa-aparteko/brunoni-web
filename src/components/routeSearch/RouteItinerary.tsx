import React from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import ItineraryItem from '../ItineraryItem';
import Stepper from '@material-ui/core/Stepper';

const useStyles = makeStyles((theme: Theme) => ({
  stepper: {
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
  },
}));

const RouteItinerary: React.FC<Props> = ({ route }) => {
  const classes = useStyles();
  return (
    <Stepper orientation="vertical" className={classes.stepper}>
      {route.OriginInfo && <ItineraryItem noLine={false} itineraryItem={route.OriginInfo} />}
      {route.IntermediatePortInfos.map((intermediatePortInfo, i) => (
        <ItineraryItem key={i} noLine={false} itineraryItem={intermediatePortInfo} />
      ))}
      {route.DestinationInfo && <ItineraryItem noLine={true} itineraryItem={route.DestinationInfo} />}
    </Stepper>
  );
};

interface Props {
  route: RouteSearchResult;
}

export default RouteItinerary;
