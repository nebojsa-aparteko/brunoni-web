import { Box, Chip, Divider, Grid, makeStyles, Theme, Typography } from '@material-ui/core';
import React, { Fragment, useMemo } from 'react';
import { Skeleton } from '@material-ui/lab';
import TextSkeleton from '../TextSkeleton';
import InfoBoxItem from '../InfoBoxItem';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { formatDateString } from './Route';
import LastPageIcon from '@material-ui/icons/LastPage';
import WavesIcon from '@material-ui/icons/Waves';
import ShareIcon from '@material-ui/icons/Share';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import { getItineraryFromSchedule } from '../onlineBooking/Summary';
import VesselAllocationButton from '../VesselAllocationButton';
import { isDashboardUser } from '../../model/UserRecord';
import useUser from '../../hooks/useUser';

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.white,
  },
  carrierAvatar: {
    width: '.75em',
    height: '.75em',
    marginRight: theme.spacing(1),
  },
}));

const RouteSummary: React.FC<Props> = ({ route }) => {
  const routeItinerary = useMemo(() => getItineraryFromSchedule(route), [route]);
  const classes = useStyles();
  const [, userRecord] = useUser();

  return (
    <Grid item xs={12}>
      <Grid container spacing={2}>
        <Grid item md={6} xs={12}>
          <Typography variant="subtitle2" display="block" gutterBottom>
            <Box fontWeight="fontWeightBold">Carrier</Box>
          </Typography>
          <Typography variant="h5" display="block">
            <Box display="flex" alignItems="center" lineHeight="normal">
              {route ? (
                <Fragment>
                  <Skeleton variant="circle" className={classes.carrierAvatar} />
                  <span>{route.OriginInfo.VoyageInfo.Carrier}</span>
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
        <Grid item container md={3} xs={12} direction={'row'}>
          <Grid item md={3} xs={12} direction={'row'}>
            <Grid item>
              <InfoBoxItem
                title="Vessel"
                label1={routeItinerary?.portOfLoading.VoyageInfo.VesselName}
                label2={routeItinerary?.portOfLoading.VoyageInfo.VoyageNr}
                gutterBottom
              />
            </Grid>
            {isDashboardUser(userRecord) && (
              <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                <VesselAllocationButton
                  vesselVoyage={routeItinerary?.portOfLoading.VoyageInfo}
                  service={route.Service}
                />
              </Grid>
            )}
          </Grid>
          <Box></Box>
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
  );
};

interface Props {
  route: RouteSearchResult;
}

export default RouteSummary;
