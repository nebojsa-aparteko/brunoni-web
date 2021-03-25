import { Box, Button, Checkbox, createStyles, makeStyles, Typography } from '@material-ui/core';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ChecklistItem,
  ChecklistItemValueDocument,
  CustomerAction,
  CustomerChecklistActionType,
  ShortChecklistItem,
  Stage,
} from '../../bookings/checklist/ChecklistItemModel';
import { ActivityLogItem, ActivityType, PaymentActivityData } from '../../bookings/checklist/ActivityModel';
import { MentionItem } from 'react-mentions';
import { flow, isNil, omit, omitBy } from 'lodash/fp';
import React, { useCallback, useContext } from 'react';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { useSnackbar } from 'notistack';
import firebase from '../../../firebase';
import DoneIcon from '@material-ui/icons/Done';
import { BookingRequest } from '../../../model/BookingRequest';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
      '&:focus': {
        outline: 'none',
      },
    },
  }),
);

const checkStageDependency = (stages: Stage[], stageId: string) => {
  let index = stages.findIndex(el => el.id === stageId);
  if (index === -1) return false;
  if (index === 0) {
    return true;
  } else return stages[index - 1].checked;
};

export const createActivityObject = (data: {
  changeType: ActivityChangeType;
  by: ActivityLogUserData;
  checklistItem?: ChecklistItem;
  documents?: ChecklistItemValueDocument[];
  stage?: Stage;
  internal?: boolean;
  isAccountingActivity?: boolean;
  paymentReference?: string;
  paymentActivityData?: PaymentActivityData;
  type?: ActivityType;
  comment?: string;
  mentions?: MentionItem[];
  addedUsers?: ActivityLogUserData[];
  removedUsers?: ActivityLogUserData[];
}): ActivityLogItem => {
  const {
    by,
    changeType,
    internal,
    checklistItem,
    paymentReference,
    paymentActivityData,
    documents,
    stage,
    isAccountingActivity,
    type,
    comment,
    mentions,
    addedUsers,
    removedUsers,
  } = data;
  return flow(omitBy(isNil))({
    changeType: changeType,
    by: by,
    at: new Date(),
    type: type || ActivityType.ACTIVITY,
    isInternal: internal,
    checklistItem: checklistItem
      ? omitBy(isNil)({
          id: checklistItem?.id,
          label: checklistItem?.label,
          checked: checklistItem?.checked,
        } as ShortChecklistItem)
      : undefined,
    documents: documents,
    stage: stage,
    comment: comment,
    mentions: mentions,
    isAccountingActivity: !!isAccountingActivity,
    paymentReference: paymentReference,
    paymentActivityData: paymentActivityData,
    addedUsers: addedUsers,
    removedUsers: removedUsers,
  } as ActivityLogItem);
};

const BookingRequestChecklistRow = ({ bookingRequest, checklistItem, isAdmin }: BookingRequestChecklistRowProp) => {
  const classes = useStyles();
  const userRecord = useContext(UserRecordContext);
  const { enqueueSnackbar } = useSnackbar();

  const getActivityLogUserData = useCallback(
    (): ActivityLogUserData =>
      ({
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName,
        alphacomClientId: userRecord?.alphacomClientId,
        alphacomId: userRecord?.alphacomId,
        emailAddress: userRecord?.emailAddress,
      } as ActivityLogUserData),
    [userRecord],
  );

  const storeActivity = useCallback(
    (checklistItemActivityHandler: () => Promise<void>) => {
      checklistItemActivityHandler()
        .then(_ => {
          enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
            variant: 'success',
            autoHideDuration: 1000,
          });
        })
        .catch(error => {
          console.error('error storing activity', error);
          enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
            variant: 'error',
            autoHideDuration: 3000,
          });
        });
    },
    [enqueueSnackbar],
  );

  const saveChecklistChanges = useCallback(
    (
      field: string,
      value: ChecklistItemValueDocument[] | undefined | boolean | ConfirmedByCustomer | Stage[] | CustomerAction,
    ) => {
      return firebase
        .firestore()
        .collection('booking-requests')
        .doc(bookingRequest?.id)
        .collection('checklist')
        .doc(checklistItem?.id)
        .update(field, value);
    },
    [bookingRequest, checklistItem],
  );

  const checklistItemMarkCompletedHandler = useCallback(
    (action: CustomerAction, type?: ActivityChangeType) => {
      return saveChecklistChanges('customerAction', action);
      // .then(_ =>
      // addActivityItem(
      //   bookingRequest!.id,
      //   createActivityObject({
      //     changeType: type ? ActivityChangeType.UNDO_COMPLETED_CUSTOMER : ActivityChangeType.DONE_BY_CUSTOMER,
      //     by: getActivityLogUserData(),
      //     checklistItem: checklistItem,
      //   }),
      // ),
      // );
    },
    [bookingRequest, checklistItem, getActivityLogUserData, saveChecklistChanges],
  );

  const handleCompleted = () => {
    const action = { ...checklistItem!.customerAction, by: getActivityLogUserData(), at: new Date() } as CustomerAction;
    storeActivity(() => checklistItemMarkCompletedHandler(action));
  };

  const handleUncompleted = () => {
    const action = omit(['by', 'at'])(checklistItem.customerAction) as CustomerAction;
    console.log('Action', action);
    storeActivity(() => checklistItemMarkCompletedHandler(action, ActivityChangeType.UNDO_COMPLETED_CUSTOMER));
  };

  return (
    <Box
      id={'checklistItemRow_' + checklistItem.id}
      display="flex"
      justifyContent="space-between"
      my={1}
      flexDirection={isAdmin && checklistItem.valuesAdmin?.length === 0 ? 'row' : 'column'}
    >
      <Box className={classes.root} display="flex" flexDirection="column" id={checklistItem.id} flex={1}>
        <Box display="flex" flexDirection="row">
          <Box flexDirection="row" alignContent="center">
            <a id={checklistItem.id} />
            {isAdmin ? (
              <Checkbox
                defaultChecked={checklistItem.checked}
                // checked={}
                disabled={!isAdmin}
                // onChange={event =>
                //   event.target.checked ? handleCheckboxChange(event.target.checked) : setActionDialogOpen(true)
                // }
              />
            ) : (
              checklistItem.checked && <DoneIcon />
            )}

            <Typography display="inline">{checklistItem.label}</Typography>
            {!isAdmin &&
              !checklistItem.checked &&
              checklistItem.customerAction &&
              checklistItem.customerAction.action === CustomerChecklistActionType.fillForm &&
              (checklistItem.customerAction.stageId
                ? checkStageDependency(checklistItem.stages, checklistItem.customerAction.stageId || '')
                : true) && (
                <Button
                  variant="outlined"
                  size="small"
                  style={{ fontSize: '0.6rem', marginLeft: '8px' }}
                  onClick={checklistItem.customerAction?.at ? handleUncompleted : handleCompleted}
                >
                  {checklistItem.customerAction?.at ? 'Undo Mark Completed' : 'Mark Completed'}
                </Button>
              )}
          </Box>
          <Box flex="1" />
        </Box>
      </Box>
    </Box>
  );
};

interface BookingRequestChecklistRowProp {
  checklistItem: ChecklistItem;
  isAdmin: boolean | undefined;
  bookingRequest: BookingRequest;
  comparableDocuments: ChecklistItemValueDocument[];
}

interface ConfirmedByCustomer {
  by: ActivityLogUserData;
  at: Date;
}

export default BookingRequestChecklistRow;
