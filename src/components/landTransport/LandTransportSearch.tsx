import React, { useContext } from 'react';
import { Box, createStyles, makeStyles, Paper, Typography } from '@material-ui/core';
import LandTransportSearchBar from './LandTransportSearchBar';
import LoadingButton from '../LoadingButton';
import { useFormContext } from 'react-hook-form';
import { LandTransportContext } from '../../providers/LandTransportProvider';
import LandTransportRouteSearchParams from '../../model/land-transport/RouteSearchParams';
import useUser from '../../hooks/useUser';
import { TransportModeType } from '../../model/land-transport/TransportMode';
import {
  LAND_TRANSPORT_FILTERS_INITIAL_STATE,
  LandTransportFilter,
  LandTransportFilterContext,
} from '../../providers/LandTransportFilterProvider';
import { uniqBy } from 'lodash';

const useStyles = makeStyles(theme =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '70%',
      margin: theme.spacing(4),
    },
    title: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: theme.spacing(2),
    },
    body: {
      display: 'flex',
      flexDirection: 'column',
      margin: theme.spacing(2),
      '& > *:not(:last-child)': {
        marginBottom: theme.spacing(2),
      },
    },
  }),
);

const getRespectiveFilters = (results: R[]) => {
  return results.reduce((previousValue, currentValue) => {
    const transportMode = currentValue.props.transportMode[0];
    const containerSize = currentValue.props.equSize[0];
    const containerType = currentValue.props.equGroup[0];
    return {
      ...previousValue,
      transportModes: uniqBy(
        [
          ...previousValue.transportModes,
          {
            checked: false,
            name: transportMode.toUpperCase(),
          },
        ],
        'name',
      ),
      containerTypes: uniqBy(
        [
          ...previousValue.containerTypes,
          {
            checked: false,
            name: containerSize.toUpperCase(),
          },
        ],
        'name',
      ),
      equipmentGroupTypes: uniqBy(
        [
          ...previousValue.equipmentGroupTypes,
          {
            checked: false,
            name: containerType.toUpperCase(),
          },
        ],
        'name',
      ),
    } as LandTransportFilter;
  }, LAND_TRANSPORT_FILTERS_INITIAL_STATE);
};

const LandTransportSearch = () => {
  const classes = useStyles();

  const { handleSubmit } = useFormContext<LandTransportRouteSearchParams>();

  const { setLandTransportRoutes, loadingRoutes, setLoadingRoutes } = useContext(LandTransportContext);
  const [, setFilters] = useContext(LandTransportFilterContext);
  const [user] = useUser();

  const handleSearch = async (data: LandTransportRouteSearchParams) => {
    setLoadingRoutes(true);
    const token = await user.getIdToken();
    const results = await getLandTransportRecords(token, data.from, data.to);
    const filters = getRespectiveFilters(results);
    setFilters(filters);
    setLandTransportRoutes(results);
    setLoadingRoutes(false);
  };

  return (
    <Paper className={classes.container}>
      <Box className={classes.title}>
        <Typography variant={'h4'}>Quickly choose</Typography>
        <Typography variant={'h4'}>your next inland transportation</Typography>
      </Box>
      <Box className={classes.body}>
        <LandTransportSearchBar />
        <LoadingButton loading={loadingRoutes} handleClick={handleSubmit(handleSearch)} />
      </Box>
    </Paper>
  );
};

export default LandTransportSearch;

const getLandTransportRecords = async (
  token: string,
  fromLocationName: string,
  toLocationName: string,
): Promise<R[]> => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/landTransport?toLocationName=${toLocationName}&fromLocationName=${fromLocationName}`,
      {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      return await response.json();
    } else {
      // todo. handle error?
      const body = await response.json();
      console.error(`Failed to request`, response, body);
      return [];
    }
  } catch (e) {
    console.error('Failed to perform request', e);
    return [];
  }
};

export interface R {
  result: SegmentsEntity[];
  props: {
    transportMode: TransportModeType[];
    equSize: string[];
    equGroup: string[];
    provider: string[];
    route: string[];
  };
}

export interface StartOrEnd {
  identity: IdentityOrStartOrEnd;
  labels?: string[] | null;
  properties: Properties;
}

export interface IdentityOrStartOrEnd {
  low: number;
  high: number;
}
export interface Properties {
  name: string;
}
export interface SegmentsEntity {
  start: StartOrEnd;
  relationship: Relationship;
  end: StartOrEnd;
}
export interface Relationship {
  identity: IdentityOrStartOrEnd;
  start: IdentityOrStartOrEnd;
  end: IdentityOrStartOrEnd;
  type: string;
  properties: HeadsTo;
}

export interface HeadsTo {
  weightRangeMin: string;
  tliNo: string;
  negot: string;
  relType: string;
  validFrom: string;
  float: string;
  equGroup: string;
  weightRangeMax: string;
  toState: string;
  rate: string;
  tliEffDate: string;
  curr: string;
  tariffReference: string;
  validTo: string;
  viaFacility: string;
  fromState: string;
  fromCountry: string;
  tliExpDate: string;
  tradeShortName: string;
  equSize: string;
  toCountry: string;
  fromGeoUnit: string;
  transportMode: string;
  fmc: string;
  remarks: string;
  weightUnit: string;
  status: string;
  provider: string;
}
