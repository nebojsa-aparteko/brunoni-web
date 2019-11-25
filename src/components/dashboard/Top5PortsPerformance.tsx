import React from 'react';
import { Card, CardHeader, Divider, CardContent, Typography } from '@material-ui/core';
import PerfectScrollbar from 'react-perfect-scrollbar';

interface Props {
  dataset: any;
}

const Top5PortsPerformance: React.FC<Props> = ({ dataset }) => {
  return (
    <Card>
      <CardHeader title="Top 5 Ports" />
      <Divider />
      <CardContent>
        <PerfectScrollbar>
          <Typography variant="subtitle2">Top 5 Origins: ....</Typography>
          <Typography variant="subtitle2">Top 5 Destinations: ....</Typography>
        </PerfectScrollbar>
      </CardContent>
    </Card>
  );
};

export default Top5PortsPerformance;
