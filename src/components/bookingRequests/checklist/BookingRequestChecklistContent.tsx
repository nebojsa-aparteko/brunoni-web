import React, { useContext } from 'react';
import ActingAs from '../../../contexts/ActingAs';
import { Box, Container } from '@material-ui/core';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import { BookingRequest } from '../../../model/BookingRequest';
import BookingRequestChecklistRow from './BookingRequestChecklistRow';
import useBookingRequestChecklist from '../../../hooks/useBookingRequestChecklist';

interface CheckListContentProps {
  bookingRequest: BookingRequest;
}

const BookingRequestChecklistContent: React.FC<CheckListContentProps> = ({ bookingRequest }) => {
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
    <Box display="flex" flexDirection="column" style={{ flex: 1 }}>
      {checklistItems?.map(item =>
        item.isInternal ? (
          !actingAs && (
            <BookingRequestChecklistRow
              key={`chkitem-${bookingRequest.id}-${item.id}`}
              bookingRequest={bookingRequest}
              isAdmin={!actingAs}
              checklistItem={item}
              comparableDocuments={[]}
            />
          )
        ) : (
          <BookingRequestChecklistRow
            key={`chkitem-${bookingRequest.id}-${item.id}`}
            bookingRequest={bookingRequest}
            isAdmin={!actingAs}
            checklistItem={item}
            comparableDocuments={[]}
          />
        ),
      )}
    </Box>
  );
};

export default BookingRequestChecklistContent;
