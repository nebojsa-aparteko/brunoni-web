import React, { forwardRef, ForwardRefRenderFunction, useContext, useImperativeHandle, useRef, useState } from 'react';
import InputProps from '../../model/InputProps';
import ContainerTypes from '../../contexts/ContainerTypes';
import ContainerType from '../../model/ContainerType';
import SelectInput from './SelectInput';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import intersectionWith from 'lodash/fp/intersectionWith';
import isEqual from 'lodash/fp/isEqual';
import flatten from 'lodash/fp/flatten';

interface Props extends InputProps<ContainerType> {
  margin?: any;
}

const getContainerTypeLabel = (containerType: ContainerType | undefined) =>
  containerType ? containerType.description : '';

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const filterFlow = (parts: string[], options: ContainerType[], findIntersection: boolean = false) => {
  const filteredItems = map((part: string) =>
    filter(
      (option: ContainerType) =>
        getContainerTypeLabel(option)
          .toLowerCase()
          .indexOf(part.toLowerCase()) > -1,
    )(options),
  )(parts);

  return findIntersection
    ? ((intersectionWith(isEqual) as any)(...filteredItems) as ContainerType[])
    : flatten(filteredItems);
};

const filterOptions = (options: ContainerType[], { inputValue }: { inputValue: string }) => {
  const searchWords = inputValue.split(' ');
  return filterFlow(searchWords, options, searchWords.length > 1);
};

const ContainerTypeInput: ForwardRefRenderFunction<any, Props> = ({ value, onChange, margin }, ref) => {
  const input = useRef();
  const containerTypes = useContext(ContainerTypes);
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => {
      focusAndSelect(input.current!);
    },
  }));

  return (
    <SelectInput
      inputRef={input}
      label="Container Type"
      margin={margin}
      options={containerTypes || []}
      filterOptions={filterOptions}
      getOptionLabel={getContainerTypeLabel}
      open={open}
      setOpen={setOpen}
      value={value}
      onChange={(containerType: ContainerType | null) => onChange(containerType)}
    />
  );
};

export default forwardRef(ContainerTypeInput);
