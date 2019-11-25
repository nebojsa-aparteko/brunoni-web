import React, { useContext, useMemo } from 'react';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import get from 'lodash/fp/get';
import keys from 'lodash/fp/keys';
import sum from 'lodash/fp/sum';
import { Card, CardHeader, Divider, CardContent, useTheme, colors } from '@material-ui/core';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Doughnut } from 'react-chartjs-2';
import Carriers from '../../contexts/Carriers';

interface Props {
  clientPerformance: any;
}

const CarrierPerformance: React.FC<Props> = ({ clientPerformance }) => {
  const theme = useTheme();
  const cs = useContext(Carriers);

  const data = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const carriers = flow(get('TEU'), keys)(clientPerformance);

    const performance = map((carrier: string) => {
      return flow(
        get(['TEU', carrier, String(currentYear)]),
        map(flow(get(['Details', 'Amount']), Number)),
        sum,
      )(clientPerformance);
    })(carriers);

    const backgroundColors = map((carrier: string) => {
      return cs?.find(c => c.ID === carrier)?.Color || colors.indigo[400];
    })(carriers);

    const total = sum(performance);

    const datasets = [
      {
        data: map((value: number) => (100 * value) / total)(performance),
        backgroundColor: backgroundColors,
        borderWidth: 8,
        borderColor: theme.palette.common.white,
        hoverBorderColor: theme.palette.common.white,
      },
    ];

    return {
      datasets,
      labels: carriers,
    };
  }, [clientPerformance, cs]);

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
