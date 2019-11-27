import React, { useMemo } from 'react';
import { Card, CardHeader, Divider, CardContent, useTheme, colors, Color } from '@material-ui/core';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Pie } from 'react-chartjs-2';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import sum from 'lodash/fp/sum';
import values from 'lodash/fp/values';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import groupBy from 'lodash/fp/groupBy';
import mapValues from 'lodash/fp/mapValues';
import keys from 'lodash/fp/keys';

interface Props {
  clientPerformance: any;
  year: number;
}

const extractContainerAggregatedData = (year: number) =>
  flow(
    get('Equipment'),
    values,
    map(get(String(year))),
    flatten,
    map(get('Details')),
    flatten,
    groupBy('Unit'),
    mapValues(flow(map(flow(get('Amount'), Number)), sum)),
  );

const ContainerTypePerformance: React.FC<Props> = ({ clientPerformance, year }) => {
  const theme = useTheme();

  const data = useMemo(() => {
    const containerData = extractContainerAggregatedData(year)(clientPerformance);

    const datasets = [
      {
        data: values(containerData),
        backgroundColor: colors.indigo[500],
        borderWidth: 2,
        borderColor: theme.palette.common.white,
        hoverBorderColor: theme.palette.common.white,
      },
    ];

    const total = sum(values(containerData));

    return {
      datasets,
      labels: keys(containerData),
      total: total,
    };
  }, [clientPerformance, theme.palette.common.white]);

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

          return `${label}: ${value} (${Math.round((value / data.total) * 100)}%)`;
        },
      },
    },
  };
  return (
    <Card>
      <CardHeader title="Container Types Performance" />
      <Divider />
      <CardContent>
        <PerfectScrollbar>
          <Pie data={data} options={options} />
        </PerfectScrollbar>
      </CardContent>
    </Card>
  );
};

export default ContainerTypePerformance;
