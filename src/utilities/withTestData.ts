import identity from 'lodash/fp/identity';

export default function withTestData<T>(name: string, transformation?: (value: any) => T) {
  if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_USE_TEST_DATA === 'true') {
    return (transformation || identity)(require(`../data/${name}.json`));
  } else {
    return undefined;
  }
}
