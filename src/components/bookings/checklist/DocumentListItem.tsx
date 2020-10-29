import React, { useCallback, useContext, useState } from 'react';
import {
  Avatar,
  Box,
  CircularProgress,
  createStyles,
  IconButton,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import AddCommentIcon from '@material-ui/icons/AddComment';
import DeleteIcon from '@material-ui/icons/Delete';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import CompareIcon from '@material-ui/icons/Compare';
import {
  ActivityLogUserData,
  ChecklistItem,
  ChecklistItemValueDocument,
  ChecklistItemValueDocumentStatusType,
  ChecklistNames,
  DocumentValue,
  DocumentValueStatus,
} from './ChecklistItemModel';
import { green } from '@material-ui/core/colors';
import { useActivityLogState } from './ActivityLogContext';
import ActingAs from '../../../contexts/ActingAs';
import { editRestriction } from './CheckList';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { invoke } from 'lodash/fp';
import firebase from '../../../firebase';
import { useSnackbar } from 'notistack';
import { formatDistanceToNowConfigured } from '../../../utilities/formattingHelpers';
import theme from '../../../theme';
import RejectionModal from '../documentApproval/RejectionModal';
import { Booking } from '../../../model/Booking';
import FlagIcon from '@material-ui/icons/Flag';
import { showCrispChat } from '../../../index';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fileItemLink: {
      textDecoration: 'none',
      color: 'inherit',
      cursor: 'pointer',
      display: 'flex',
    },
    progressWrapper: {
      margin: theme.spacing(1),
      position: 'relative',
    },
    iconDeleteProgress: {
      color: green[500],
      position: 'absolute',
      top: -6,
      left: -6,
      zIndex: 1,
    },
    approved: {
      backgroundColor: 'rgba(0,200,81, 0.7)',
    },
    reject: {
      backgroundColor: 'rgba(255,68,68, 0.7)',
    },
    final: {
      '&:hover': {
        color: '#F7BC06',
      },
    },
  }),
);

const { NODE_ENV } = process.env;

const findClassName = (item: DocumentValueStatus | undefined, classes: any) => {
  if (!item) {
    return '';
  }
  if (item.type === ChecklistItemValueDocumentStatusType.DEFAULT) return '';
  if (item.type === ChecklistItemValueDocumentStatusType.APPROVED) return classes.approved;
  if (item.type === ChecklistItemValueDocumentStatusType.REJECTED) return classes.reject;
};

const findTextForStatusType = (type: ChecklistItemValueDocumentStatusType) => {
  switch (type) {
    case ChecklistItemValueDocumentStatusType.APPROVED:
      return 'Approved';
    case ChecklistItemValueDocumentStatusType.DEFAULT:
      return '';
    case ChecklistItemValueDocumentStatusType.REJECTED:
      return 'Revision needed';
  }
};

const DocumentListItem = ({
  item,
  checklistItem,
  booking,
  changeStatus,
  deleteFile,
  storageBasePath,
  internal,
  isAccountingDocument,
  markAsFinal,
  comparableDocuments,
  selectForComparison,
  ...other
}: DocumentListItemProps) => {
  const classes = useStyles();
  const activityLogContext = useActivityLogState();
  const userRecord = useContext(UserRecordContext);
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isComparisonDialog, setIsComparisonDialog] = useState<boolean>(false);
  const [isAccountingDialog, setIsAccountingDialog] = useState<boolean>(false);

  const handleDialogClose = useCallback(() => {
    showCrispChat(true);
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  const handleDialogOpen = useCallback(() => {
    showCrispChat(false);
    setIsDialogOpen(true);
  }, [setIsDialogOpen]);
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

  const [removalInProgress, setRemovalInProgress] = useState(false); //used when file is being removed from the list

  const handleMention = useCallback(
    () =>
      activityLogContext.setState({
        documentReference: { ...item, isInternal: internal },
        checklistReference: checklistItem,
        internal: isAccountingDocument ? true : internal,
        isAccountingActivity: isAccountingDialog,
      }),
    [checklistItem, internal, item, activityLogContext, isAccountingDialog, isAccountingDocument],
  );
  const checklistCheckedRule = useCallback(() => checklistItem?.checked, [checklistItem]);

  const handleDeleteFile = useCallback(
    (item: ChecklistItemValueDocument | DocumentValue, internal: boolean) => {
      setRemovalInProgress(true);
      try {
        if (!editRestriction(item.uploadedAt as Date)) {
          return enqueueSnackbar(
            <Typography color="inherit">
              Failed to edit item - You cant change status after 30sec from last change!
            </Typography>,
            {
              variant: 'error',
              autoHideDuration: 1000,
            },
          );
        }
        const path = [storageBasePath, `${item.storedName}`].join('/');
        const storageRef = firebase.storage().ref();
        const documentRef = storageRef.child(encodeURI(path));
        if (
          !internal &&
          checklistItem &&
          checklistItem.valuesAdmin?.findIndex(f => f.storedName === item.storedName) !== -1
        ) {
          const newItemArray = checklistItem.values?.filter(chkItem => chkItem !== item);
          deleteFile && deleteFile(item, newItemArray || [], internal);
        } else {
          documentRef
            .delete()
            .then(() => {
              console.debug('file deleted from storage ', item);
            })
            .catch(error => {
              console.error('Failed to remove item - {error.message}', error);
            })
            .finally(() => {
              // remove item from the list in any case since if it is an error with the storage means file is alrady out
              setRemovalInProgress(false);
              let newItemArray: ChecklistItemValueDocument[] | DocumentValue[] | undefined = [];
              if (checklistItem) {
                newItemArray = internal
                  ? checklistItem.valuesAdmin?.filter(chkItem => chkItem !== item)
                  : checklistItem.values?.filter(chkItem => chkItem !== item);
                deleteFile && deleteFile(item, newItemArray || [], internal);
              } else {
                deleteFile && deleteFile(item);
              }
            });
        }
      } catch (error) {
        setRemovalInProgress(false);
        enqueueSnackbar(<Typography color="inherit">Failed to remove item - {error.message}!</Typography>, {
          variant: 'error',
          autoHideDuration: 1000,
        });
      }
    },
    [storageBasePath, checklistItem, removalInProgress, deleteFile, enqueueSnackbar],
  );

  return (
    <div {...other}>
      <ListItem>
        <a
          href={item.url}
          download={item.name}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.fileItemLink}
        >
          <ListItemAvatar>
            <Avatar color="primary" className={findClassName(item.status, classes)}>
              <DescriptionIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            id={`filelistitem-${item.storedName}`}
            disableTypography
            primary={
              <Typography style={{ wordBreak: 'break-word', paddingRight: theme.spacing(5) }}>{item.name}</Typography>
            }
            secondary={
              <span>
                <Typography variant="caption">
                  {`${formatDistanceToNowConfigured(item.uploadedAt)} ${
                    isAdmin ? ` by ${item.uploadedBy.firstName}` : ''
                  }`}
                </Typography>
                <br />
                {item.status?.at && (
                  <Typography variant="caption">
                    {`${findTextForStatusType(item.status?.type)} ${formatDistanceToNowConfigured(
                      invoke('toDate')(item.status.at),
                    )} by ${item.status?.by?.firstName}`}
                  </Typography>
                )}
              </span>
            }
          />
        </a>
        <ListItemSecondaryAction>
          <div className={classes.progressWrapper}>
            {isAdmin &&
            !internal &&
            checklistItem &&
            (checklistItem.id === ChecklistNames.B_L || checklistItem.id === ChecklistNames.SHIPPING_INSTRUCTIONS) ? (
              <IconButton size="small" aria-label="Add to Comparison" onClick={() => selectForComparison(item)}>
                <CompareIcon style={{ color: item.isSelectedForComparison ? '#F7BC06' : 'inherit' }} />
              </IconButton>
            ) : null}
            <IconButton size="small" aria-label="Add Comment" onClick={handleMention}>
              <AddCommentIcon style={{ color: (item.mentionCount || 0) > 0 ? '#F7BC06' : 'inherit' }} />
            </IconButton>
            {item.status?.type !== ChecklistItemValueDocumentStatusType.APPROVED &&
              editRestriction(item.uploadedAt) &&
              !checklistCheckedRule() && (
                <IconButton
                  edge="end"
                  size="small"
                  aria-label="Remove File"
                  onClick={event => {
                    event.stopPropagation();
                    handleDeleteFile(item, internal);
                  }}
                  aria-labelledby={`filelistitem-${item.storedName}`}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            {removalInProgress && <CircularProgress size={42} className={classes.iconDeleteProgress} />}
            {checklistItem && checklistItem.id === ChecklistNames.B_L && (
              <IconButton
                size="small"
                aria-label="Mark as final"
                onClick={() => markAsFinal(item)}
                disabled={!isAdmin || checklistCheckedRule()}
              >
                <FlagIcon className={classes.final} style={{ color: item.final ? '#F7BC06' : 'inherit' }} />
              </IconButton>
            )}
          </div>
        </ListItemSecondaryAction>
      </ListItem>
      {(isAdmin ? true : !item.final) &&
        ((internal && isAdmin) || (!internal && !isAdmin)) &&
        (((item.status?.at ? editRestriction(item.status.at) : true) &&
          (!internal && !isAdmin && NODE_ENV === 'production'
            ? userRecord?.emailAddress !== item.uploadedBy.emailAddress
            : true) &&
          !checklistCheckedRule() &&
          checklistItem &&
          checkIfShouldShowStatusAction(checklistItem.id)) ||
          isAccountingDocument) && (
          <Box display="flex" ml={2} flexBasis="fit-content">
            {item.status !== undefined && item.status?.type !== ChecklistItemValueDocumentStatusType.DEFAULT && (
              <Box display="flex" ml={2} mb={2}>
                <AccessTimeIcon style={{ color: '#5f91c5' }} />
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    changeStatus(item, {
                      type: ChecklistItemValueDocumentStatusType.DEFAULT,
                      by: getActivityLogUserData(),
                    });
                    activityLogContext.setState(undefined);
                  }}
                >
                  Undo
                </Link>
              </Box>
            )}
            {item.status?.type !== ChecklistItemValueDocumentStatusType.APPROVED && (
              <Box display="flex" ml={2} mb={2} alignItems="center" justifyContent="center">
                <CheckCircleOutlineOutlinedIcon style={{ color: '#5f91c5' }} />
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    changeStatus(item, {
                      type: ChecklistItemValueDocumentStatusType.APPROVED,
                      by: getActivityLogUserData(),
                      at: new Date(),
                    });
                    activityLogContext.setState(undefined);
                  }}
                >
                  Approve
                </Link>
              </Box>
            )}
            {!isAccountingDocument && item.status?.type !== ChecklistItemValueDocumentStatusType.REJECTED && (
              <Box display="flex" ml={2} mb={2} alignItems="center" justifyContent="center">
                <CancelOutlinedIcon style={{ color: '#5f91c5' }} />
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    setIsComparisonDialog(false);
                    setIsAccountingDialog(false);
                    handleDialogOpen();
                  }}
                >
                  Request amendment
                </Link>
              </Box>
            )}
            {!isAdmin &&
              !isAccountingDocument &&
              (internal ? true : item.isSelectedForComparison) &&
              item.status?.type !== ChecklistItemValueDocumentStatusType.REJECTED && (
                <Box display="flex" ml={2} mb={2} alignItems="center" justifyContent="center">
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                      setIsComparisonDialog(true);
                      setIsAccountingDialog(false);
                      handleDialogOpen();
                    }}
                  >
                    Compare Documents
                  </Link>
                </Box>
              )}
            {isAdmin && internal && isAccountingDocument && (
              <Box display="flex" ml={2} mb={2} alignItems="center" justifyContent="center">
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    setIsComparisonDialog(true);
                    setIsAccountingDialog(true);

                    handleDialogOpen();
                  }}
                >
                  Check Accounting Document
                </Link>
              </Box>
            )}
          </Box>
        )}
      {isDialogOpen && (
        <RejectionModal
          isOpen={isDialogOpen}
          handleClose={handleDialogClose}
          booking={booking}
          checklistItem={checklistItem}
          document={item}
          changeStatus={changeStatus}
          allDocuments={comparableDocuments}
          isComparisonDialog={isComparisonDialog}
          isAccountingDialog={isAccountingDialog}
        />
      )}
    </div>
  );
};

export default DocumentListItem;

export interface DocumentListItemPropsBase {
  checklistItem?: ChecklistItem;
  booking: Booking;
  storageBasePath: string;
  changeStatus: (item: ChecklistItemValueDocument, status: DocumentValueStatus) => void;
  deleteFile?: (
    item: ChecklistItemValueDocument | DocumentValue,
    documents?: ChecklistItemValueDocument[] | DocumentValue[],
    internal?: boolean,
  ) => void;
  internal: boolean;
  isAccountingDocument?: boolean;
  markAsFinal: (item: ChecklistItemValueDocument) => void;
  comparableDocuments: ChecklistItemValueDocument[];
  selectForComparison: (item: ChecklistItemValueDocument) => void;
}

interface DocumentListItemProps extends DocumentListItemPropsBase {
  item: ChecklistItemValueDocument;
}

const dontShowStatusActionForSomeChecklist = ['IMO', 'SOC_CERTIFICATE', 'SHIPPING_INSTRUCTIONS'];
const checkIfShouldShowStatusAction = (id: string) => !dontShowStatusActionForSomeChecklist.includes(id);
