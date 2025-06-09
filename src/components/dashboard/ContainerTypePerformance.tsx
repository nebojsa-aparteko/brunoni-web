import React, { useContext, useMemo } from 'react';
import {
  Card,
  CardHeader,
  Divider,
  CardContent,
  useTheme,
  colors,
  makeStyles,
  useMediaQuery,
} from '@material-ui/core';
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
import find from 'lodash/fp/find';
import ContainerTypes from '../../contexts/ContainerTypes';
import ChartsCircularProgress from './ChartsCircularProgress';

import {
  Chart as ChartJS,
  CategoryScale,
  ArcElement,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  ArcElement,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface Props {
  clientPerformance: any;
  year: number;
}

const extractContainerAggregatedData = (year: number) =>
  flow(
    get('Equipment'),
    values,
    map(get(String(year))),
    values,
    flatten,
    map(values),
    flatten,
    flatten,
    groupBy('Unit'),
    mapValues(flow(map(flow(get('AmountTEU'), Number)), sum)),
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

  const isSmAndUp = useMediaQuery(theme.breakpoints.up('sm'));

  const data = useMemo(() => {
    if (!clientPerformance) {
      return undefined;
    }

    const containerData = extractContainerAggregatedData(year)(clientPerformance);
    const labels = keys(containerData).map(key => {
      const containerType = find((element: any) => element.id === key)(containerTypes);
      return containerType ? containerType.description : key;
    });
    const datasets = [
      {
        data: values(containerData),
        backgroundColor: [
          colors.indigo[500],
          colors.green[500],
          colors.indigo[300],
          colors.red[500],
          colors.indigo[400],
          colors.blue[800],
          colors.indigo[800],
          colors.indigo[600],
          colors.red[600],
          colors.green[100],
          colors.green[800],
          colors.red[800],
          colors.blue[200],
          colors.indigo[200],
          colors.blue[500],
          colors.blue[800],
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
    animation: {
      duration: 0,
    },
    plugins: {
      legend: {
        display: isSmAndUp && data?.datasets && data.datasets[0].data.length < 6,
        position: 'right' as const,
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        caretSize: 10,
        padding: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20,
        },
        borderWidth: 1,
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.common.white,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        footerColor: theme.palette.text.secondary,
        callbacks: {
          label: (context: any) => {
            const label = context.chart.data.labels[context.dataIndex];
            const value = context.chart.data.datasets[0].data[context.dataIndex];
            const total = context.chart.data.datasets[0].data.reduce(
              (a: number, b: number) => a + b,
              0,
            );

            return `${label}: ${value} (${Math.round((value / total) * 100)}%)`;
          },
        },
      },
    },
    layout: {
      padding: 0,
    },
  };
  return (
    <Card>
      <CardHeader title="Container Types" />
      <Divider />
      <CardContent className={classes.root}>
        {!data ? (
          <ChartsCircularProgress />
        ) : (
          <PerfectScrollbar>
            <Pie data={data} options={options} />
          </PerfectScrollbar>
        )}
      </CardContent>
    </Card>
  );
};

export default ContainerTypePerformance;
