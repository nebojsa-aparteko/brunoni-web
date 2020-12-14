import { Box, Paper, Typography } from '@material-ui/core';
import { formatDateSafe } from '../../../utilities/formattingHelpers';
import currencyFormatter from '../../../utilities/currencyFormatter';
import Commission, { CommissionStatus } from '../../../model/Commission';
import React from 'react';

const AccountingCommission = ({ commission }: AccountingCommissionProps) => {
  return (
    <Paper
      style={{
        backgroundColor: 'rgba(255,0,0,0.05)',
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 12,
        paddingBottom: 12,
        margin: 4,
      }}
    >
      <Box flex={1} display="flex" flexDirection="row" justifyContent="space-between">
        <Typography variant={'h5'}>{formatDateSafe(commission.dueDate, 'd. MMMM yyyy.')}</Typography>
        <Typography variant={'h5'}>
          {'Amount: '.concat(currencyFormatter(commission.currency)(commission.amount))}
        </Typography>
        <Typography
          variant={'h5'}
          style={{
            fontWeight: 700,
            color:
              commission.status === CommissionStatus.PAID
                ? 'rgba(0,200,81)'
                : commission.status === CommissionStatus.INVOICED
                ? '#0070df'
                : '#000',
          }}
        >
          {commission.status}
        </Typography>
      </Box>
    </Paper>
  );
};

interface AccountingCommissionProps {
  commission: Commission;
}

export default AccountingCommission;
