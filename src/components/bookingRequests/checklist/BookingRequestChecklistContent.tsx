import React, { Fragment, useContext } from 'react';
import ActingAs from '../../../contexts/ActingAs';
import { Box, Container, Divider, List } from '@material-ui/core';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import { BookingRequest } from '../../../model/BookingRequest';
import BookingRequestChecklistRow from './BookingRequestChecklistRow';
import useBookingRequestChecklist from '../../../hooks/useBookingRequestChecklist';

interface CheckListContentProps {
  bookingRequest: BookingRequest;
  isCommentIconHidden?: boolean;
}

const BookingRequestChecklistContent: React.FC<CheckListContentProps> = ({ bookingRequest, isCommentIconHidden }) => {
  const checklistItems = useBookingRequestChecklist(bookingRequest.id || '-');
  const actingAs = useContext(ActingAs)[0];

  if (!checklistItems) {
    return (
      <Container>
        <ChartsCircularProgress />
      </Container>
    );
  }

  return (
    <List>
      {checklistItems?.map(item =>
        !(actingAs && item.isInternal) ? (
          <Fragment>
            <BookingRequestChecklistRow
              key={`chkitem-${bookingRequest.id}-${item.id}`}
              bookingRequest={bookingRequest}
              isAdmin={!actingAs}
              checklistItem={item}
              comparableDocuments={[]}
              isCommentIconHidden={isCommentIconHidden}
            />
            <Divider />
          </Fragment>
        ) : null,
      )}
    </List>
  );
};

export default BookingRequestChecklistContent;
