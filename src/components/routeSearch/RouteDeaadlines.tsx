import React from 'react';
import { Grid } from '@material-ui/core';
import InfoBoxItem from '../InfoBoxItem';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';

const RouteDeadlines: React.FC<Props> = ({ route }) => {
  return (
    <>
      {route!.Deadlines.map((deadline, i) => (
        <Grid key={i} item md={4} sm={4}>
          <InfoBoxItem
            title={`${deadline.Typ}
    closing`}
            label1={deadline.Time}
          />
        </Grid>
      ))}
    </>
  );
};

interface Props {
  route: RouteSearchResult;
}

export default RouteDeadlines;
