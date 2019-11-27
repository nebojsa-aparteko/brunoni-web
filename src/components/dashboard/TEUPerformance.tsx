import React, { useMemo } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Bar } from 'react-chartjs-2';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import mapValues from 'lodash/fp/mapValues';
import get from 'lodash/fp/get';
import values from 'lodash/fp/values';
import flatten from 'lodash/fp/flatten';
import groupBy from 'lodash/fp/groupBy';
import sum from 'lodash/fp/sum';
import { Card, CardHeader, Divider, CardContent, useTheme, colors } from '@material-ui/core';

interface Props {
  clientPerformance: any;
  year: number;
}

const normalizeByYear = (year: number) =>
  flow(
    get('TEU'),
    values,
    flatten,
    map(get(String(year))),
    flatten,
    groupBy('Month'),
    mapValues(flow(map(flow(get('Details.Amount'), Number)), sum)),
    values,
  );

const TEUPerformance: React.FC<Props> = ({ clientPerformance, year }) => {
  const theme = useTheme();

  const data = useMemo(() => {
    const dataProp = {
      [year]: normalizeByYear(year)(clientPerformance),
      [year - 1]: normalizeByYear(year - 1)(clientPerformance),
      [year - 2]: normalizeByYear(year - 2)(clientPerformance),
    };

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const datasets = [
      {
        label: year - 2,
        backgroundColor: colors.grey[200],
        data: dataProp[year - 2],
        barThickness: 12,
        maxBarThickness: 10,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
      },
      {
        label: year - 1,
        backgroundColor: colors.grey[400],
        data: dataProp[year - 1],
        barThickness: 12,
        maxBarThickness: 10,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
      },
      {
        label: 'YTD',
        backgroundColor: theme.palette.primary.main,
        data: dataProp[year],
        barThickness: 12,
        maxBarThickness: 10,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
      },
    ];

    return {
      datasets,
      labels,
    };
  }, [clientPerformance, theme.palette.primary.main]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cornerRadius: 20,
    legend: {
      display: false,
    },
    layout: {
      padding: 0,
    },
    scales: {
      xAxes: [
        {
          gridLines: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            padding: 20,
            fontColor: theme.palette.text.secondary,
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            borderDash: [2],
            borderDashOffset: [2],
            color: theme.palette.divider,
            drawBorder: false,
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2],
            zeroLineColor: theme.palette.divider,
          },
          ticks: {
            padding: 20,
            fontColor: theme.palette.text.secondary,
            beginAtZero: true,
            min: 0,
            maxTicksLimit: 5,
            callback: (value: any) => {
              return value;
            },
          },
        },
      ],
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
        title: () => {},
        label: (tooltipItem: any) => {
          return `${data.datasets[tooltipItem.datasetIndex].label}: ${tooltipItem.yLabel}`;
        },
      },
    },
  };
  return (
    <Card>
      <CardHeader title="TEU Performance" />
      <Divider />
      <CardContent>
        <PerfectScrollbar>
          <Bar data={data} options={options} />
        </PerfectScrollbar>
      </CardContent>
    </Card>
  );
};

export default TEUPerformance;
