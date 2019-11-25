import React from 'react';
import { Box, Typography } from '@material-ui/core';
import update from 'lodash/fp/update';
import identity from 'lodash/identity';
import useEndpoint from '../hooks/useEndpoint';

interface Props {}

const updateClientPerformanceResults = identity; // TODO

const updateClientPerformanceBody = identity; // TODO

const initialResults =
  process.env.NODE_ENV !== 'production'
    ? updateClientPerformanceBody(require('../test/ClientPerformanceDataTest.json'))
    : undefined;

const ClientPerformance: React.FC<Props> = ({}) => {
  const { busy, error, result, refresh } = useEndpoint(
    '/clientPerformance',
    update('ClientPerformance', updateClientPerformanceResults),
    initialResults,
  );

  return (
    <Box>
      <Typography variant="h6">busy</Typography>
      <Typography>{JSON.stringify(busy)}</Typography>
      <Typography variant="h6">error</Typography>
      <Typography>{JSON.stringify(error)}</Typography>
      <Typography variant="h6">result</Typography>
      <Typography>{JSON.stringify(result)}</Typography>
      <Typography variant="h6">refresh</Typography>
      <Typography>{JSON.stringify(refresh)}</Typography>
    </Box>
  );
};

export default ClientPerformance;
