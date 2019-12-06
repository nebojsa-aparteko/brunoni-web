import React, { forwardRef, useContext, useImperativeHandle, useMemo, useRef, useState } from 'react';
import InputProps from '../../model/InputProps';
import Locations from '../../contexts/PickupLocations';
import PickupLocation from '../../model/PickupLocation';
import SelectInput from './SelectInput';
import orderBy from 'lodash/fp/orderBy';
import get from 'lodash/fp/get';
import CommodityType from '../../model/CommodityType';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import includes from 'lodash/fp/includes';
import intersectionWith from 'lodash/fp/intersectionWith';
import isEqual from 'lodash/fp/isEqual';
import flatten from 'lodash/fp/flatten';
import { adrNameToFilterOut, doNotShowCities } from '../../utilities/pickupDropOffHelperData';

interface Props extends InputProps<PickupLocation | undefined> {
  margin?: any;
}

const filterFlow = (parts: string[], options: PickupLocation[], findIntersection: boolean = false) => {
  const filteredItems = map((part: string) =>
    filter(
      (option: PickupLocation) =>
        getLocationLabel(option)
          .toLowerCase()
          .indexOf(part.toLowerCase()) > -1,
    )(options),
  )(parts);

  return findIntersection
    ? ((intersectionWith(isEqual) as any)(...filteredItems) as PickupLocation[])
    : flatten(filteredItems);
};

const filterOptions = (options: PickupLocation[], { inputValue }: { inputValue: string }) => {
  const searchWords = inputValue.split(' ');
  return filterFlow(searchWords, options, searchWords.length > 1);
};

export const getLocationLabel = (location: PickupLocation | undefined) =>
  location ? `${location.name} - ${location.city} - ${location.countryCode}`.toUpperCase() : '';

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const LocationInput: React.FC<Props> = ({ value, onChange, margin }, ref) => {
  const input = useRef();
  const locations = useContext(Locations);
  const [open, setOpen] = useState(false);

  const sortedLocations = useMemo(
    () =>
      orderBy(
        [get('countryCode'), get('city'), get('name')],
        'asc',
      )(
        filter((location: PickupLocation) => {
          const adrNameFiltered = includes(location.name.toLowerCase())(adrNameToFilterOut);
          const shouldNotBeShown = includes(location.city.toLowerCase())(doNotShowCities);
          return !(adrNameFiltered || shouldNotBeShown); // || !portOnlyLocation;
        })(locations),
      ),
    [locations],
  );

  useImperativeHandle(ref, () => ({
    focus: () => {
      focusAndSelect(input.current!);
    },
  }));

  return (
    <SelectInput
      inputRef={input}
      label="Pickup/Dropoff Location in EUROPE"
      margin={margin}
      options={sortedLocations}
      getOptionLabel={getLocationLabel}
      filterOptions={filterOptions}
      open={open}
      setOpen={setOpen}
      value={value}
      onChange={(location: PickupLocation | undefined) => onChange(location)}
    />
  );
};

export default forwardRef(LocationInput);
