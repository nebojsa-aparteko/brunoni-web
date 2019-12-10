import React, { Fragment } from 'react';
import { Grid, useMediaQuery, useTheme } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import InfoBoxItem from '../InfoBoxItem';
import { Remark } from '../../providers/QuoteGroups';

interface Props {
  remarks: Remark[];
}

const QuoteItemRemarks: React.FC<Props> = ({ remarks }) => {
  const theme = useTheme();
  const isSmAndDown = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Fragment>
      <Divider />
      {remarks.map((remark, i) => (
        <Fragment key={i}>
          <Grid item md={3} sm={4} xs={isSmAndDown ? 12 : 4}>
            <InfoBoxItem title={remark.RemarkTitle} label1={remark.RemarkLabel} />
          </Grid>
          <Grid item md={9} sm={8} xs={isSmAndDown ? 12 : 8}>
            <InfoBoxItem label1={remark.RemarkText} occupySpaceForTitle={remark.RemarkTitle !== null} />
          </Grid>
        </Fragment>
      ))}
    </Fragment>
  );
};

export default QuoteItemRemarks;
