import React from 'react';
import { Card, CardHeader, Divider, CardContent, useTheme, colors } from '@material-ui/core';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Doughnut } from 'react-chartjs-2';

interface Props {
  dataset: any;
}

const CarrierPerformance: React.FC<Props> = ({ dataset }) => {
  const theme = useTheme();

  const data = {
    datasets: [
      {
        data: [48, 32],
        backgroundColor: [colors.indigo[500], colors.indigo[300]],
        borderWidth: 8,
        borderColor: theme.palette.common.white,
        hoverBorderColor: theme.palette.common.white,
      },
    ],
    labels: ['HSG', 'HAMBURG'],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cutoutPercentage: 80,
    legend: {
      display: false,
    },
    layout: {
      padding: 0,
    },
    tooltips: {
      enabled: true,
      mode: 'index',
      intersect: false,
      caretSize: 10,
      yPadding: 20,
      xPadding: 20,
      borderWidth: 1,
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.common.white,
      titleFontColor: theme.palette.text.primary,
      bodyFontColor: theme.palette.text.secondary,
      footerFontColor: theme.palette.text.secondary,
      callbacks: {
        label: (tooltipItem: any, data: any) => {
          const label = data['labels'][tooltipItem['index']];
          const value = data['datasets'][0]['data'][tooltipItem['index']];

          return `${label}: ${value}%`;
        },
      },
    },
  };
  return (
    <Card>
      <CardHeader title="Share per Carrier" />
      <Divider />
      <CardContent>
        <PerfectScrollbar>
          <Doughnut data={data} options={options} />
        </PerfectScrollbar>
      </CardContent>
    </Card>
  );
};

export default CarrierPerformance;
