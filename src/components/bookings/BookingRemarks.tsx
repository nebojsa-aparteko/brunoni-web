import { Booking, Remark } from '../../model/Booking';
import { Typography } from '@material-ui/core';
import React, { useMemo } from 'react';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import filter from 'lodash/fp/filter';
import { remark } from './BookingViewMainContent';

const BookingRemarks = ({ booking }: Props) => {
  const finalRemarks: Remark[] = useMemo(
    () =>
      booking
        ? flow(
            get('Remarks'),
            filter((item: Remark) => item.RemarkType === remark.final),
          )(booking)
        : [],
    [booking],
  );

  return (
    <React.Fragment>
      {finalRemarks.map((item, index) => {
        const text = item.RemarkTxt.split('<br/><br/>'); // split the string into an array for each new paragraph

        return item.RemarkTxt ? (
          <Typography variant="body2" key={`final-remark-${index}`}>
            <span
              dangerouslySetInnerHTML={{
                __html: text.map(remark => remark.split('<br/>').join('')).join('<br/><br/>'),
              }}
            />
            {/* remove all <br/> from the elements of the string array to get rid of manual new rows and join the elements, aka paragraphs with <br/><br/> as they were initially */}
          </Typography>
        ) : null;
      })}
    </React.Fragment>
  );
};

interface Props {
  booking: Booking;
}

export default BookingRemarks;
