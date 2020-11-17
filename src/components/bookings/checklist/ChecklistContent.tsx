import ChecklistItemRow from './ChecklistItemRow';
import { Box, Container } from '@material-ui/core';
import React, { useContext, useMemo } from 'react';
import { Booking } from '../../../model/Booking';
import { ChecklistItemValueDocument, ChecklistNames } from './ChecklistItemModel';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import useChecklist from '../../../hooks/useChecklist';
import ActingAs from '../../../contexts/ActingAs';

interface CheckListContentProps {
  booking: Booking;
}

const ChecklistContent = ({ booking }: CheckListContentProps) => {
  const checklistItems = useChecklist(booking.id);
  const actingAs = useContext(ActingAs)[0];

  const comparableDocuments = useMemo(
    () =>
      checklistItems
        ?.filter(
          checklistItem =>
            checklistItem.id === ChecklistNames.SHIPPING_INSTRUCTIONS || checklistItem.id === ChecklistNames.B_L,
        )
        .map(item =>
          (item.values || []).map(
            i =>
              ({
                ...i,
                checklistId: item.id,
              } as ChecklistItemValueDocument),
          ),
        )
        .reduce((acc, val) => acc.concat(val), [])
        .filter(document => document.isSelectedForComparison) || [],
    [checklistItems],
  );

  if (!checklistItems) {
    return (
      <Container>
        <ChartsCircularProgress />
      </Container>
    );
  }

  return (
    <Box display="flex" flexDirection="column" style={{ flex: 1 }}>
      {checklistItems.map(item => (
        <ChecklistItemRow
          key={`chkitem-${booking.id}-${item.id}`}
          checklistItem={item}
          isAdmin={!actingAs}
          booking={booking}
          comparableDocuments={comparableDocuments}
        />
      ))}
    </Box>
  );
};

export default ChecklistContent;
