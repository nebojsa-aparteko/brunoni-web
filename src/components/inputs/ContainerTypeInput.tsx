import React, { useContext, useState } from 'react';
import { InputProps } from '../../model/InputProps';
import ContainerTypes from '../../contexts/ContainerTypes';
import { ContainerType } from '../../model/get-quotes/ContainerType';
import SelectInput from './SelectInput';

interface Props extends InputProps<ContainerType | undefined> {}

const getContainerTypeLabel = (containerType: ContainerType | undefined) =>
  containerType ? containerType.Description : '';

const ContainerTypeInput: React.FC<Props> = ({ value, onChange }) => {
  const containerTypes = useContext(ContainerTypes);
  const [open, setOpen] = useState(false);

  return (
    <SelectInput
      options={containerTypes}
      getOptionLabel={getContainerTypeLabel}
      open={open}
      setOpen={setOpen}
      value={value}
      onChange={(containerType: ContainerType | undefined) => onChange(containerType)}
    />
  );
};

export default ContainerTypeInput;
