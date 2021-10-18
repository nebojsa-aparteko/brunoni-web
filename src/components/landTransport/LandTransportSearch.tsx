import React, { useContext, useState } from 'react';
import { Box, createStyles, makeStyles, Paper, Typography } from '@material-ui/core';
import LandTransportSearchBar from './LandTransportSearchBar';
import ContainerInput from '../inputs/ContainerInput';
import { isDashboardUser } from '../../model/UserRecord';
import ListInput from '../inputs/ListInput';
import Container from '../../model/Container';
import UserRecordContext from '../../contexts/UserRecordContext';
import ContainerDetails from '../../model/ContainerDetails';
import LoadingButton from '../LoadingButton';
import { useFormContext } from 'react-hook-form';
import { LandTransportContext } from '../../providers/LandTransportProvider';
import LandTransportRouteSearchParams from '../../model/land-transport/RouteSearchParams';
import useUser from '../../hooks/useUser';

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

const LandTransportSearch = () => {
  const classes = useStyles();

  const userRecord = useContext(UserRecordContext);
  const [containers, setContainers] = useState<(Container & ContainerDetails)[]>([]);
  const [loading, setLoading] = useState(false);

  const { handleSubmit } = useFormContext<LandTransportRouteSearchParams>();

  const [, setLandTransport] = useContext(LandTransportContext);
  const [user] = useUser();
  const { watch } = useFormContext();

  const handleSearch = async (data: LandTransportRouteSearchParams) => {
    setLoading(true);
    const token = await user.getIdToken();
    const result = await getLandTransportRecords(
      token,
      watch('from'),
      watch('to'),
      watch('transportMode').toUpperCase(),
    );
    setLandTransport(result);
    setLoading(false);
  };

  return (
    <Paper className={classes.container}>
      <Box className={classes.title}>
        <Typography variant={'h4'}>Quickly choose</Typography>
        <Typography variant={'h4'}>your next inland transportation</Typography>
      </Box>
      <Box className={classes.body}>
        <LandTransportSearchBar />
        <ListInput
          ItemInput={ContainerInput}
          ItemInputProps={{
            showLocations: true,
            isDetailedInput: false,
            shouldShowAllDepots: isDashboardUser(userRecord),
          }}
          addText="Add Container"
          defaultItemValue={{ quantity: 1, imo: [false], oog: [false] }}
          value={containers}
          onChange={setContainers}
        />
        {/*<ControlledListInput*/}
        {/*  name={'containers'}*/}
        {/*  ItemInputProps={{*/}
        {/*    label: 'at'*/}
        {/*  }}*/}
        {/*  ItemInput={ControlledLandLocationInput}*/}
        {/*/>*/}
        <LoadingButton loading={loading} handleClick={handleSubmit(handleSearch)} />
      </Box>
    </Paper>
  );
};

export default LandTransportSearch;

const getLandTransportRecords = async (
  token: string,
  fromLocationName: string,
  toLocationName: string,
  transportMode: string,
) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/landTransport?toLocationName=${toLocationName}&fromLocationName=${fromLocationName}&transportMode=${transportMode}`,
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
      const body = await response.json();
      return body;
    } else {
      const body = await response.json();
      console.error(`Failed to request`, response, body);
      return body;
    }
  } catch (e) {
    console.error('Failed to perform request', e);
  } finally {
  }
};
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
}
