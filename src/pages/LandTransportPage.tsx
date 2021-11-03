import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import { Box, createStyles, makeStyles } from '@material-ui/core';
import LandTransportSearch from '../components/landTransport/LandTransportSearch';
import LandTransportResults from '../components/landTransport/LandTransportResults';
import { useForm, FormProvider } from 'react-hook-form';
import LandTransportProvider from '../providers/LandTransportProvider';
import LandTransportRouteSearchParams from '../model/land-transport/RouteSearchParams';
import LandTransportFilterProvider from '../providers/LandTransportFilterProvider';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  }),
);

const LandTransportPage = () => {
  const classes = useStyles();

  const methods = useForm<LandTransportRouteSearchParams>();

  return (
    <Fragment>
      <Meta title="Land Transport" />
      <Box className={classes.container}>
        <FormProvider {...methods}>
          <LandTransportFilterProvider>
            <LandTransportProvider>
              <LandTransportSearch />
              <LandTransportResults />
            </LandTransportProvider>
          </LandTransportFilterProvider>
        </FormProvider>
      </Box>
    </Fragment>
  );
};

export default LandTransportPage;
