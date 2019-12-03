import React, { useContext, useMemo } from 'react';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import get from 'lodash/fp/get';
import keys from 'lodash/fp/keys';
import sum from 'lodash/fp/sum';
import mapValues from 'lodash/fp/mapValues';
import update from 'lodash/fp/update';
import values from 'lodash/fp/values';
import flatten from 'lodash/fp/flatten';
import forEach from 'lodash/fp/forEach';
import { Card, CardHeader, Divider, CardContent, useTheme, colors } from '@material-ui/core';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Doughnut } from 'react-chartjs-2';
import Carriers from '../../contexts/Carriers';
import ChartsCircularProgress from './ChartsCircularProgress';
import filter from 'lodash/fp/filter';
import logAs from '../../utilities/logAs';

interface Props {
  clientPerformance: any;
  year: number;
}

const performanceByCarrierByYear = (year: number) => {
  return flow(
    get(['TEU']),
    mapValues(
      update(String(year), flow(mapValues(flow(flatten, map(flow(get('Amount'), Number)), sum)), values, flatten, sum)),
    ),
  );
};

const CarrierPerformance: React.FC<Props> = ({ clientPerformance, year }) => {
  const theme = useTheme();
  const cs = useContext(Carriers);

  const data = useMemo(() => {
    const carriers = flow(get('TEU'), keys)(clientPerformance);

    const performanceCarrierYear = performanceByCarrierByYear(year)(clientPerformance);
    // handle odd case where the carrier can have a total sum of zero TEUs
    // eliminate him from the list
    let nonZeroTEUCarriers: string[] = [];
    let datapoints: number[] = [];

    Object.entries(performanceCarrierYear).forEach(([key, value]) => {
      const yearSum: number = get(String(year))(value);
      if (yearSum !== 0) {
        nonZeroTEUCarriers.push(key);
        datapoints.push(yearSum);
      }
    });

    const backgroundColors = map((carrier: string) => {
      return cs?.find(c => c.id === carrier)?.color || colors.grey[100];
    })(carriers);

    const total = sum(datapoints);

    const labels = nonZeroTEUCarriers.map(key => {
      const carrierInfo = filter((element: any) => element.id === key)(cs)[0];
      return carrierInfo ? carrierInfo.name.toUpperCase() : '';
    });

    const datasets = [
      {
        data: datapoints,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: theme.palette.common.white,
        hoverBorderColor: theme.palette.common.white,
      },
    ];

    return {
      datasets,
      labels: labels,
      total: total,
    };
  }, [clientPerformance, cs, theme.palette.common.white, year]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cutoutPercentage: 60,
    legend: {
      display: true,
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
            value / data.total < 0.5 ? (value / data.total).toFixed(3) : Math.round((value / data.total) * 100)
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
