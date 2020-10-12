import React from 'react';
import PaymentOverviewTable from './PaymentOverviewTable';
import usePaymentOverview from '../../hooks/usePaymentOverview';
import { Box, Card, CardContent, CardHeader, Typography } from '@material-ui/core';

const PaymentOverviewContainer = () => {
  const overviewData = usePaymentOverview();

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h3" display="inline">
              Weekly Payment
            </Typography>
          </Box>
        }
      />
      <CardContent>
        <PaymentOverviewTable overviewData={overviewData} />
      </CardContent>
    </Card>
  );
};

export default PaymentOverviewContainer;
