import { Button, IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  BookingRequest,
  BookingRequestStatusCode,
  BookingRequestStatusText,
} from '../model/BookingRequest';
import { useBookingRequestContext } from '../providers/BookingRequestProvider';
import useUser from '../hooks/useUser';
import { isDashboardUser } from '../model/UserRecord';
import useSaveBookingRequest from '../hooks/useSaveBookingRequest';
import Mousetrap from 'mousetrap';

const EditButton: React.FC<Props> = ({ bookingRequest }) => {
  const userRecord = useUser()[1];
  const [bookingRequestState, setBookingRequestState, editing, setEditing] =
    useBookingRequestContext();
  const handleSave = useSaveBookingRequest(bookingRequest, bookingRequestState);

  useEffect(() => {
    Mousetrap.bind(['command+shift+e', 'ctrl+shift+e'], () => setEditing(prevState => !prevState));
    return () => {
      Mousetrap.unbind(['command+shift+e', 'ctrl+shift+e']);
    };
  }, [setEditing]);

  const canEdit = useMemo(
    () =>
      !(
        bookingRequest.statusCode >= BookingRequestStatusCode.CONFIRMED ||
        (bookingRequest.statusText !== BookingRequestStatusText.REQUESTED &&
          !isDashboardUser(userRecord))
      ),
    [bookingRequest, userRecord],
  );

  const handleCancelEditing = useCallback(() => {
    setBookingRequestState(bookingRequest);
    setEditing(false);
  }, [bookingRequest, setBookingRequestState, setEditing]);

  return editing ? (
    <>
      <Button variant="contained" onClick={handleCancelEditing} size="small">
        Cancel
      </Button>
      <Button
        color={'primary'}
        variant="contained"
        onClick={handleSave}
        size="small"
        style={{ marginLeft: '1em' }}
      >
        Save changes
      </Button>
    </>
  ) : (
    <IconButton
      size="small"
      aria-label="Edit"
      component="span"
      onClick={() => setEditing(true)}
      disabled={!canEdit}
    >
      <EditIcon />
    </IconButton>
  );
};

export default EditButton;

interface Props {
  bookingRequest: BookingRequest;
}
