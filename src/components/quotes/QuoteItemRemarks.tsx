import React, { Fragment } from 'react';
import Linkify from 'react-linkify';
import { Grid, Link, useMediaQuery, useTheme } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import InfoBoxItem from '../InfoBoxItem';
import { Remark } from '../../providers/QuoteGroupsProvider';

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
            <Linkify>
              <InfoBoxItem
                title={remark.RemarkTitle}
                label1HTML={remark.RemarkLabel ? { __html: remark.RemarkLabel } : ''}
              />
            </Linkify>
          </Grid>
          <Grid item md={9} sm={8} xs={isPrint ? 8 : 12}>
            <Linkify
              componentDecorator={(decoratedHref: string, decoratedText: string, key: number) => (
                <Link key={key} href={decoratedHref}>
                  {decoratedText}
                </Link>
              )}
            >
              <InfoBoxItem
                label1HTML={{ __html: remark.RemarkText }}
                occupySpaceForTitle={isXS || remark.RemarkTitle !== undefined}
              />
            </Linkify>
          </Grid>
        </Fragment>
      ))}
    </Fragment>
  );
};

export default QuoteItemRemarks;
