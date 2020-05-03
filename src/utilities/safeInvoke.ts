import invoke from 'lodash/fp/invoke';

const safeInvoke = (method: string) => (object: any) => (object ? invoke(method)(object) : null);

export default safeInvoke;
