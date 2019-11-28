import React, { useContext, useMemo } from 'react';
import { Card, CardHeader, Divider, CardContent, useTheme, colors, makeStyles } from '@material-ui/core';
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
import filter from 'lodash/fp/filter';
import ContainerTypes from '../../contexts/ContainerTypes';

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

const useStyles = makeStyles(theme => ({
  root: {
    [theme.breakpoints.up('md')]: {
      paddingTop: '3.2em',
      paddingBottom: '1em',
    },
  },
}));

const ContainerTypePerformance: React.FC<Props> = ({ clientPerformance, year }) => {
  const theme = useTheme();
  const classes = useStyles();

  const containerTypes = useContext(ContainerTypes);

  const data = useMemo(() => {
    const containerData = extractContainerAggregatedData(year)(clientPerformance);
    console.log('CD', containerTypes);
    const labels = keys(containerData).map(
      key => filter((element: any) => element.id === key)(containerTypes)[0]['description'],
    );
    const datasets = [
      {
        data: values(containerData),
        backgroundColor: [
          colors.indigo[500],
          colors.indigo[100],
          colors.indigo[300],
          colors.indigo[400],
          colors.indigo[800],
          colors.indigo[600],
        ],
        borderWidth: 2,
        borderColor: theme.palette.common.white,
        hoverBorderColor: theme.palette.common.white,
      },
    ];

    const total = sum(values(containerData));

    return {
      datasets,
      labels: labels,
      total: total,
    };
  }, [clientPerformance, theme.palette.common.white, year, containerTypes]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cutoutPercentage: 0,
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

          return `${label}: ${value} (${Math.round((value / data.total) * 100)}%)`;
        },
      },
    },
  };
  return (
    <Card>
      <CardHeader title="Container Types" />
      <Divider />
      <CardContent className={classes.root}>
        <PerfectScrollbar>
          <Pie data={data} options={options} />
        </PerfectScrollbar>
      </CardContent>
    </Card>
  );
};

export default ContainerTypePerformance;
