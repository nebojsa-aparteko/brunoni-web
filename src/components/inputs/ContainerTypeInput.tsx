import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import InputProps from '../../model/InputProps';
import ContainerTypes from '../../contexts/ContainerTypes';
import ContainerType from '../../model/ContainerType';
import SelectInput from './SelectInput';

interface Props extends InputProps<ContainerType | undefined> {}

const getContainerTypeLabel = (containerType: ContainerType | undefined) =>
  containerType ? containerType.description : '';

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const ContainerTypeInput: React.FC<Props> = ({ value, onChange }, ref) => {
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
      options={containerTypes}
      getOptionLabel={getContainerTypeLabel}
      open={open}
      setOpen={setOpen}
      value={value}
      onChange={(containerType: ContainerType | undefined) => onChange(containerType)}
    />
  );
};

export default forwardRef(ContainerTypeInput);
