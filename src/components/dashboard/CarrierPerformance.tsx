import React, { useContext, useMemo } from 'react';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import get from 'lodash/fp/get';
import sum from 'lodash/fp/sum';
import mapValues from 'lodash/fp/mapValues';
import update from 'lodash/fp/update';
import upperCase from 'lodash/fp/upperCase';
import defaultTo from 'lodash/fp/defaultTo';
import flatten from 'lodash/fp/flatten';
import toPairs from 'lodash/fp/toPairs';
import { Card, CardHeader, Divider, CardContent, useTheme, colors, useMediaQuery } from '@material-ui/core';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Doughnut } from 'react-chartjs-2';
import Carriers from '../../contexts/Carriers';
import ChartsCircularProgress from './ChartsCircularProgress';
import filter from 'lodash/fp/filter';

interface Props {
  clientPerformance: any;
  year: number;
}

const performanceByCarrierByYear = (year: number) =>
  flow(
    get(['TEU']),
    mapValues(flow(get(String(year)), map(flow(flatten, map(flow(get('Amount'), Number)), sum)), sum)),
  );

const CarrierPerformance: React.FC<Props> = ({ clientPerformance, year }) => {
  const theme = useTheme();
  const carriers = useContext(Carriers);

  const isSmAndUp = useMediaQuery(theme.breakpoints.up('sm'));

  const data = useMemo(() => {
    const values = flow(
      performanceByCarrierByYear(year),
      toPairs,
      map(update(0, carrierId => carriers?.find(carrier => carrier.id === carrierId) || { name: carrierId })),
      filter(get(1)),
    )(clientPerformance);

    const data = map(get(1))(values);

    return {
      datasets: [
        {
          data,
          backgroundColor: map(flow(get([0, 'color']), defaultTo(colors.grey[100])))(values),
          borderWidth: 2,
          borderColor: theme.palette.common.white,
          hoverBorderColor: theme.palette.common.white,
        },
      ],
      labels: map(flow(get([0, 'name']), upperCase))(values),
      total: sum(data),
    };
  }, [clientPerformance, carriers, theme.palette.common.white, year]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cutoutPercentage: 60,
    legend: {
      display: isSmAndUp && data?.datasets && data.datasets[0].data.length < 6,
      position: 'right',
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

          return `${label}: ${value} (${
            value / data.total < 0.005 ? (value / data.total).toFixed(3) : Math.round((value / data.total) * 100)
          }%)`;
        },
      },
    },
  };
  return (
    <Card>
      <CardHeader title="Share per Carrier" />
      <Divider />
      <CardContent>
        {!data ? (
          <ChartsCircularProgress />
        ) : (
          <PerfectScrollbar>
            <Doughnut data={data} options={options} />
          </PerfectScrollbar>
        )}
      </CardContent>
    </Card>
  );
};

export default CarrierPerformance;
