import React, { useContext } from 'react';
import ActingAs from '../../../contexts/ActingAs';
import { ChecklistItem } from '../../bookings/checklist/ChecklistItemModel';
import { Box, Container } from '@material-ui/core';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import { BookingRequest } from '../../../model/BookingRequest';
import BookingRequestChecklistRow from './BookingRequestChecklistRow';

interface CheckListContentProps {
  bookingRequest: BookingRequest;
}

let checklistItems = [
  {
    id: '01',
    label: 'Vessel Space',
    order: 1,
    checked: false,
    stages: [],
  },
  {
    id: '02',
    label: 'Equipment',
    order: 2,
    checked: false,
    stages: [],
  },
  {
    id: '03',
    label: 'Quotation Agreement',
    order: 3,
    checked: false,
    stages: [],
  },
  {
    id: '04',
    label: 'Commodity Check',
    order: 4,
    checked: false,
    stages: [],
    isInternal: true,
  },
  {
    id: '05',
    label: 'Weight Check',
    order: 5,
    checked: false,
    stages: [],
    isInternal: true,
  },
  {
    id: '06',
    label: 'Terminal check',
    order: 6,
    checked: false,
    stages: [],
    isInternal: true,
  },
  {
    id: '07',
    label: 'Pickup Ref and Delivery Ref',
    order: 7,
    checked: false,
    stages: [],
    isInternal: true,
  },
  {
    id: '08',
    label: 'Closings Check',
    order: 8,
    checked: false,
    stages: [],
    isInternal: true,
  },
] as ChecklistItem[];

const BookingRequestChecklistContent = ({ bookingRequest }: CheckListContentProps) => {
  // const checklistItems = bookingRequest.id && useChecklist(bookingRequest.id);
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
      {checklistItems.map(item =>
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
