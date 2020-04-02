import flatMap from 'lodash/fp/flatMap';
import reduce from 'lodash/fp/reduce';

export default function(prop: string, searchString: string): boolean {
  const byMultiple = flatMap((value: string) => prop?.toLowerCase().indexOf(value.toLowerCase()) !== -1)(
    searchString.split(' '),
  );
  return reduce((one: boolean, other: boolean) => one && other, true)(byMultiple);
}
