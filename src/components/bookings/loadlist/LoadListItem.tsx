import React from 'react';
import { Card, CardHeader, CardContent } from '@material-ui/core';
import LoadListContainerModel from '../../../model/LoadListContainerModel';
import formatDate from 'date-fns/format';

const LoadListItem = ({ item }: Props) => {
  return (
    <Card>
      <CardHeader title={`${formatDate(item.ets, 'dd.MM.yyyy')} (ETS)`} />
      <CardContent></CardContent>
    </Card>
  );
};

export default LoadListItem;

interface Props {
  item: LoadListContainerModel;
}
