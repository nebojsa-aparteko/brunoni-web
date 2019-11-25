import React from 'react';
import { Card, CardHeader, Divider, CardContent, useTheme, colors } from '@material-ui/core';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Bar } from 'react-chartjs-2';

interface Props {
  dataset: any;
}

const CustomerPerformance: React.FC<Props> = ({ dataset }) => {
  const theme = useTheme();

  const dataProp = {
    thisYear: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20],
    lastYear: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13],
    yearBeforeLast: [4, 2, 5, 0, 12, 24, 44, 10, 11, 12, 13, 13],
  };

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const data = {
    datasets: [
      {
        label: 'YTD',
        backgroundColor: theme.palette.primary.main,
        data: dataProp.thisYear,
        barThickness: 12,
        maxBarThickness: 10,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
      },
      {
        label: '2018',
        backgroundColor: colors.grey[400],
        data: dataProp.lastYear,
        barThickness: 12,
        maxBarThickness: 10,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
      },
      {
        label: '2017',
        backgroundColor: colors.grey[200],
        data: dataProp.yearBeforeLast,
        barThickness: 12,
        maxBarThickness: 10,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
      },
    ],
    labels,
  };

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

export default CustomerPerformance;
