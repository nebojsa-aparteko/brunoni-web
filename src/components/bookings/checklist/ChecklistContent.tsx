import React, { useEffect, useState } from 'react';
import { TableBody } from '@material-ui/core';
import ChecklistItemRow from './ChecklistItemRow';
import { Booking } from '../../../model/Booking';
import firebase from '../../../firebase';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';

const ChecklistContent: React.FC<TableBodyProps> = ({ isAdmin, booking }) => {
  const [checklistItems, setChecklistItems] = useState([]);
  useEffect(() => {
    firebase
      .firestore()
      .collection('bookings')
      .doc(booking?.id)
      .collection('checklist')
      .orderBy('order')
      .get()
      .then(checklist => setChecklistItems(flow(get('docs'))(checklist).map((doc: any) => doc.data())));
  }, [booking]);

  return (
    <TableBody>
      {/* Exception #2: Shipper's owned Container */}
      {checklistItems.map(item => (
        <ChecklistItemRow checklistItem={item} isAdmin={isAdmin} booking={booking} />
      ))}
    </TableBody>
  );
};

interface TableBodyProps {
  isAdmin?: boolean;
  booking: Booking | undefined;
}

export default ChecklistContent;
