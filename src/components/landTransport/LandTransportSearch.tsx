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
import { DATA } from './landtransport.data';
import { LandTransportContext } from '../../providers/LandTransportProvider';
import LandTransportRouteSearchParams from '../../model/land-transport/RouteSearchParams';

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

  const handleSearch = (data: LandTransportRouteSearchParams) => {
    setLoading(true);
    setTimeout(() => {
      console.log(data);
      console.log('searched!');
      setLandTransport(DATA);
      setLoading(false);
    }, 500);
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
