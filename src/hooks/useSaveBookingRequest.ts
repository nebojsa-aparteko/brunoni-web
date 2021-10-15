import { useCallback, useEffect } from 'react';
import { isEqual } from 'lodash/fp';
import { BookingRequest } from '../model/BookingRequest';
import omitEmptyDeep from '../utilities/omitEmptyDeep';
import { handleFieldsEditActivity, updateBookingRequest } from '../components/bookingRequests/BookingRequestView';
import useGlobalAppState from './useGlobalAppState';
import { useBookingRequestContext } from '../providers/BookingRequestProvider';
import useUser from './useUser';
import useActivityLogUserData from './useActivityLogUserData';
import Mousetrap from 'mousetrap';

const useSaveBookingRequest = (bookingRequest: BookingRequest, bookingRequestState: BookingRequest) => {
  const isAdmin = useUser()[2];
  const editing = useBookingRequestContext()[2];
  const setEditing = useBookingRequestContext()[3];
  const getActivityLogUserData = useActivityLogUserData();
  const [, dispatch] = useGlobalAppState();

  const handleSave = useCallback(() => {
    const br = !isEqual(bookingRequest.schedule, bookingRequestState?.schedule)
      ? ({ ...bookingRequestState, isScheduleChanged: true } as BookingRequest)
      : bookingRequestState;
    omitEmptyDeep(br, false);
    dispatch({ type: 'START_GLOBAL_LOADING' });
    if (br) {
      updateBookingRequest(br)
        ?.then(() => {
          dispatch({ type: 'SHOW_SUCCESS_SNACKBAR', message: 'Saved changes!' });
        })
        .catch(error => {
          console.error('error saving booking request', error);
          dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: error.message });
        })
        .finally(async () => {
          setEditing(false);
          try {
            await handleFieldsEditActivity(bookingRequest, bookingRequestState, isAdmin, getActivityLogUserData);
          } catch (error) {
            console.error('error creating activity', error);
            dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: error.message });
          } finally {
            dispatch({ type: 'STOP_GLOBAL_LOADING' });
          }
        });
    }
  }, [bookingRequest, bookingRequestState, dispatch, getActivityLogUserData, isAdmin, setEditing]);

  useEffect(() => {
    editing && Mousetrap.bind(['command+shift+s', 'ctrl+shift+s'], () => handleSave());
    Mousetrap.stopCallback = () => false;

    return () => {
      Mousetrap.unbind(['command+shift+s', 'ctrl+shift+s']);
    };
  }, [editing, handleSave]);

  return handleSave;
};

export default useSaveBookingRequest;
