import React, { forwardRef, ForwardRefRenderFunction, useContext, useImperativeHandle, useRef, useState } from 'react';
import InputProps from '../../model/InputProps';
import CommodityTypes from '../../contexts/CommodityTypes';
import CommodityType from '../../model/CommodityType';
import SelectInput from './SelectInput';
import filter from 'lodash/fp/filter';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import intersectionWith from 'lodash/fp/intersectionWith';
import isEqual from 'lodash/fp/isEqual';

interface Props extends InputProps<CommodityType> {
  margin: string;
}

const filterFlow = (parts: string[], options: CommodityType[], findIntersection: boolean = false) => {
  const filteredItems = map((part: string) =>
    filter(
      (option: CommodityType) =>
        getCommodityTypeLabel(option)
          .toLowerCase()
          .indexOf(part.toLowerCase()) > -1,
    )(options),
  )(parts);

  return findIntersection
    ? ((intersectionWith(isEqual) as any)(...filteredItems) as CommodityType[])
    : flatten(filteredItems);
};

const filterOptions = (options: CommodityType[], { inputValue }: { inputValue: string }) => {
  const searchWords = inputValue.split(' ');
  return filterFlow(searchWords, options, searchWords.length > 1);
};

const getCommodityTypeLabel = (commodityType: CommodityType | undefined) => (commodityType ? commodityType.name : '');

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const CommodityTypeInput: ForwardRefRenderFunction<any, Props> = ({ value, onChange, margin }, ref) => {
  const input = useRef();
  const commodityTypes = useContext(CommodityTypes);
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => {
      focusAndSelect(input.current!);
    },
  }));

  return (
    <SelectInput
      inputRef={input}
      label="Commodity Type"
      margin={margin}
      filterOptions={filterOptions}
      options={commodityTypes || []}
      getOptionLabel={getCommodityTypeLabel}
      open={open}
      setOpen={setOpen}
      value={value}
      onChange={(commodityType: CommodityType | null) => onChange(commodityType)}
    />
  );
};

export default forwardRef(CommodityTypeInput);
