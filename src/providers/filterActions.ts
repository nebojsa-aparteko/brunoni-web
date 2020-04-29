import { DateRange } from '../components/daterangepicker/types';
import UserRecord from '../model/UserRecord';
import Client from '../model/Client';
import Port from '../model/Port';
import set from 'lodash/fp/set';
import { subWeeks } from 'date-fns';

export type ActionType = 'set' | 'clear';
export type FilterFields =
  | 'dateRange'
  | 'archived'
  | 'category'
  | 'pendingPayment'
  | 'assignee'
  | 'originPort'
  | 'destinationPort'
  | 'clientFilter';

export const INITIAL_DATERANGE_FILTER = {
  startDate: subWeeks(new Date(), 2),
  endDate: new Date(),
};

// filters by which we can filter bookings
export interface ContextFilters {
  dateRange?: DateRange;
  archived?: boolean;
  pendingPayment?: boolean;
  assignee?: UserRecord;
  clientFilter?: Client;
  originPort?: Port;
  destinationPort?: Port;
}

export type Action = {
  type: ActionType;
  field: FilterFields;
  value?: DateRange | boolean | string | undefined | Port | Client | UserRecord;
};

export const reducer = <T extends ContextFilters>(state: T, action: Action): T => {
  switch (action.type) {
    case 'set':
      return set(action.field, action.value)(state);
    case 'clear':
      return set(action.field, undefined)(state);
    default:
      return state;
  }
};
