import { ActivityChangeType, ActivityLogUserData } from '../components/bookings/checklist/ChecklistItemModel';
import isString from './isString';
import { ActivityLogItem, Platform } from '../components/bookings/checklist/ActivityModel';
import { capitalCase } from 'change-case';

export const isPlatformActivity = (by: ActivityLogUserData | Platform): by is Platform =>
  isString(by) && by === 'PLATFORM';

export const getFullName = (activity: ActivityLogItem) =>
  isPlatformActivity(activity.by)
    ? 'Platform'
    : `${capitalCase(activity.by?.firstName || '')} ${capitalCase(activity.by?.lastName || '')}`;

export const activityHasLink = (activity: ActivityLogItem): boolean =>
  [
    ActivityChangeType.ADD_FILE,
    ActivityChangeType.SELECT_FOR_COMPARISON,
    ActivityChangeType.UNSELECT_FOR_COMPARISON,
    ActivityChangeType.MARK_AS_FINAL,
    ActivityChangeType.UNMARK_AS_FINAL,
    ActivityChangeType.DOCUMENT_STATUS_CHANGED,
  ].some(type => type === activity.changeType);
