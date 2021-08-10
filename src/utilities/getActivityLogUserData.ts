import UserRecord, { UserRecordMin } from '../model/UserRecord';
import { ActivityLogUserData } from '../components/bookings/checklist/ChecklistItemModel';

export const getActivityLogUserData = (user: UserRecord | UserRecordMin | null | undefined): ActivityLogUserData =>
  ({
    firstName: user?.firstName,
    lastName: user?.lastName,
    alphacomClientId: user?.alphacomClientId,
    alphacomId: user?.alphacomId,
    emailAddress: user?.emailAddress,
  } as ActivityLogUserData);
