import safeInvoke from './safeInvoke';

const normalizeFirestoreDate = (val: any) => safeInvoke('toDate')(val);

export default normalizeFirestoreDate;
