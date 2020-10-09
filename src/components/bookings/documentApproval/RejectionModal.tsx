import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Booking } from '../../../model/Booking';
import { MentionItem } from 'react-mentions';
import {
  ActivityLogUserData,
  ChecklistItem,
  ChecklistItemValueDocument,
  ChecklistItemValueDocumentStatus,
  ChecklistItemValueDocumentStatusType,
} from '../checklist/ChecklistItemModel';
import { flow, isNil, omitBy } from 'lodash/fp';
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

  const onReject = useCallback(() => {
    handleCommentSave(rejectionInput!.message, rejectionInput!.mentions, !actingAs);
  }, [rejectionInput, actingAs]);

  const updateDocumentStatus = (newStatus: ChecklistItemValueDocumentStatusType) => {
    changeStatus(document, {
      type: newStatus,
      by: userActivityLogData,
      at: new Date(),
    });
    handleClose();
  };

  const handleCommentSave = useCallback(
    (messageBody: string, mentions: MentionItem[], internal: boolean) => {
      addActivityItem(
        booking.id,
        flow(omitBy(isNil))({
          type: ActivityType.COMMENT,
          comment: messageBody,
          at: new Date(),
          by: userActivityLogData,
          isInternal: internal,
          checklistItem: shortenedChecklist(checklistItem),
          documents: shortenedDocumentValue(document),
          mentions: mentions,
        } as ActivityLogItem),
      )
        .then(_ => {
          updateDocumentStatus(ChecklistItemValueDocumentStatusType.REJECTED);
          console.log('Success saving message');
        })
        .catch(err => console.log(err));
    },
    [booking.id, userRecord, checklistItem, document],
  );

  return !isComparisonDialog ? (
    <RejectionDialog
      booking={booking}
      checklistItem={checklistItem}
      isOpen={isOpen}
      handleClose={handleClose}
      onReject={onReject}
      rejectionInput={rejectionInput}
      onRejectionInputChange={onRejectionInputChange}
    />
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
    />
  );
};

export default RejectionModal;

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  booking: Booking;
  document: ChecklistItemValueDocument;
  checklistItem: ChecklistItem;
  changeStatus: (item: ChecklistItemValueDocument, status: ChecklistItemValueDocumentStatus) => void;
  allDocuments?: ChecklistItemValueDocument[];
  isComparisonDialog: boolean;
  rightDocumentInitially?: ChecklistItemValueDocument;
}

export interface RejectionInput {
  message: string;
  messagePlain: string;
  mentions: MentionItem[];
}
