import get from 'lodash/get';

//Record<string, any> is generic Object of any type
//limit to 100 if less than n filters applied
export const isNumberOfAppliedFiltersLessThan = (
  filters: { [key: string]: any },
  watchingFilters: string[],
  n: number,
): boolean => {
  const numberOfAppliedFilters = watchingFilters.filter(curr => !!get(filters, curr)).length;
  return numberOfAppliedFilters <= n;
};
