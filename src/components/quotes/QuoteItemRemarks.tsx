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
  const isXS = useMediaQuery(theme.breakpoints.only('xs'));
  const isPrint = window.matchMedia ? window.matchMedia('print').matches : false;
  return (
    <Fragment>
      <Divider />
      {remarks.map((remark, i) => (
        <Fragment key={i}>
          <Grid item md={3} sm={4} xs={isPrint ? 4 : 12}>
            <InfoBoxItem title={remark.RemarkTitle} label1={remark.RemarkLabel} />
          </Grid>
          <Grid item md={9} sm={8} xs={isPrint ? 8 : 12}>
            <InfoBoxItem
              label1HTML={{ __html: remark.RemarkText }}
              occupySpaceForTitle={isXS ? false : remark.RemarkTitle !== null}
            />
          </Grid>
        </Fragment>
      ))}
    </Fragment>
  );
};

export default QuoteItemRemarks;
