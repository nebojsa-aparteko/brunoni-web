import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Booking } from '../../../model/Booking';
import { MentionItem } from 'react-mentions';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ChecklistItem,
  ChecklistItemValueDocument,
  ChecklistItemValueDocumentStatusType,
  DocumentValueStatus,
} from '../checklist/ChecklistItemModel';
import { isNil, omitBy } from 'lodash/fp';
import { ActivityLogItem, ActivityType } from '../checklist/ActivityModel';
import { shortenedChecklist, shortenedDocumentValue } from '../../../utilities/shortenedModel';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { addActivityItem } from '../checklist/ActivityLogContainer';
import ActingAs from '../../../contexts/ActingAs';
import RejectionDialog from './RejectionDialog';
import ComparisonDialog from './ComparisonDialog';

const sortByDate = (a: ChecklistItemValueDocument, b: ChecklistItemValueDocument) => {
  return b.uploadedAt.getTime() - a.uploadedAt.getTime();
};

const RejectionModal: React.FC<Props> = ({
  isOpen,
  booking,
  handleClose,
  checklistItem,
  document,
  changeStatus,
  allDocuments,
  isComparisonDialog,
  isAccountingDialog,
}) => {
  const [rejectionInput, setRejectionInput] = useState<RejectionInput | undefined>(undefined);
  const actingAs = useContext(ActingAs)[0];
  const userRecord = useContext(UserRecordContext);
  const sortedDocuments = useMemo<ChecklistItemValueDocument[]>(
    () => (allDocuments && allDocuments.length > 0 ? allDocuments.sort(sortByDate) : []),
    [allDocuments],
  );

  const userActivityLogData = {
    firstName: userRecord?.firstName,
    lastName: userRecord?.lastName,
    alphacomClientId: userRecord?.alphacomClientId,
    alphacomId: userRecord?.alphacomId,
    emailAddress: userRecord?.emailAddress,
  } as ActivityLogUserData;

  const onRejectionInputChange = useCallback((input: RejectionInput) => {
    setRejectionInput(input);
  }, []);

  const updateDocumentStatus = useCallback(
    (newStatus: ChecklistItemValueDocumentStatusType, dontCreateActivity?: boolean) => {
      changeStatus(
        document,
        {
          type: newStatus,
          by: userActivityLogData,
          at: new Date(),
        },
        dontCreateActivity,
      );
      handleClose();
    },
    [document, changeStatus, handleClose, userActivityLogData],
  );

  const handleCommentSave = useCallback(
    (messageBody: string, mentions: MentionItem[], internal: boolean) => {
      addActivityItem(
        booking.id,
        omitBy(isNil)({
          type: ActivityType.ACTIVITY_WITH_COMMENT,
          comment: messageBody,
          changeType: ActivityChangeType.DOCUMENT_STATUS_CHANGED,
          at: new Date(),
          by: userActivityLogData,
          isInternal: internal,
          isAccountingActivity: isAccountingDialog,
          checklistItem: shortenedChecklist(checklistItem),
          documents: [shortenedDocumentValue(document)],
          mentions: mentions,
        }) as ActivityLogItem,
      )
        .then(_ => {
          updateDocumentStatus(ChecklistItemValueDocumentStatusType.REJECTED, true);
          console.log('Success saving message');
        })
        .catch(err => console.log(err));
    },
    [
      booking.id,
      checklistItem,
      document,
      isAccountingDialog,
      updateDocumentStatus,
      userActivityLogData,
    ],
  );

  const onReject = useCallback(() => {
    handleCommentSave(rejectionInput!.messagePlain, rejectionInput!.mentions, !actingAs);
  }, [rejectionInput, actingAs, handleCommentSave]);

  return !isComparisonDialog ? (
    checklistItem ? (
      <RejectionDialog
        booking={booking}
        checklistItem={checklistItem}
        isOpen={isOpen}
        handleClose={handleClose}
        onReject={onReject}
        rejectionInput={rejectionInput}
        onRejectionInputChange={onRejectionInputChange}
      />
    ) : null
  ) : (
    <ComparisonDialog
      document={document}
      isOpen={isOpen}
      handleClose={handleClose}
      booking={booking}
      updateDocumentStatus={updateDocumentStatus}
      sortedDocuments={sortedDocuments}
      onReject={onReject}
      rejectionInput={rejectionInput}
      onRejectionInputChange={onRejectionInputChange}
      isAccountingDialog={isAccountingDialog}
    />
  );
};

export default RejectionModal;

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  booking: Booking;
  document: ChecklistItemValueDocument;
  checklistItem?: ChecklistItem;
  changeStatus: (
    item: ChecklistItemValueDocument,
    status: DocumentValueStatus,
    dontCreateActivity?: boolean,
  ) => void;
  allDocuments?: ChecklistItemValueDocument[];
  isComparisonDialog: boolean;
  isAccountingDialog?: boolean;
}

export interface RejectionInput {
  message: string;
  messagePlain: string;
  mentions: MentionItem[];
}
