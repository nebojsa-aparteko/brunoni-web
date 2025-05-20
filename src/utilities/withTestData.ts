import identity from 'lodash/fp/identity';

export default function withTestData<T>(name: string, transformation?: (value: any) => T) {
  if (
    import.meta.env.MODE !== 'production' &&
    import.meta.env.VITE_REACT_APP_USE_TEST_DATA === 'true'
  ) {
    return (transformation || identity)(`../data/${name}.json`);
  } else {
    return undefined;
  }
}
