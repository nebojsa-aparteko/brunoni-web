import React, { Fragment, useMemo } from 'react';
import useContainers from '../../../hooks/useContainers';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import { flow, groupBy } from 'lodash/fp';
import LoadListItem from './LoadListItem';

const LoadListContainer = () => {
  const containers = useContainers();
  const normalizedContainers = useMemo(
    () =>
      map(
        flow(update('ets', invoke('toDate')), update('pickUp', invoke('toDate')), update('gateIn', invoke('toDate'))),
      )(containers),
    [containers],
  );
  return (
    <Fragment>
      {Object.values(groupBy('ets')(normalizedContainers)).map((c: any) =>
        c.map((b: any) => <LoadListItem item={b} />),
      )}
    </Fragment>
  );
};

export default LoadListContainer;
