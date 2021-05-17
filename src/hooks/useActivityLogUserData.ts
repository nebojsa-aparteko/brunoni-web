import useUser from './useUser';
import { useMemo } from 'react';
import { ActivityLogUserData } from '../components/bookings/checklist/ChecklistItemModel';

export default () => {
  const [, userRecord] = useUser();
  return useMemo(
    () =>
      ({
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName,
        alphacomClientId: userRecord?.alphacomClientId,
        alphacomId: userRecord?.alphacomId,
        emailAddress: userRecord?.emailAddress,
      } as ActivityLogUserData),
    [userRecord],
  );
};
