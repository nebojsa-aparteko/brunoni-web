interface FirebaseAction {
  date: Date;
  userEmail: string;
  userAlphacomId: string;
  done: boolean;
  type: FirebaseActionType;
}

export enum FirebaseActionType {
  MARK_ALL_NOTIFICATIONS_AS_READ = 'MARK_ALL_NOTIFICATIONS_AS_READ',
}

export default FirebaseAction;
