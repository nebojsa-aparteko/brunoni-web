import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import InputProps from '../../model/InputProps';
import CommodityTypes from '../../contexts/CommodityTypes';
import CommodityType from '../../model/CommodityType';
import SelectInput from './SelectInput';

interface Props extends InputProps<CommodityType | undefined> {
  margin: string;
}

const getCommodityTypeLabel = (commodityType: CommodityType | undefined) => (commodityType ? commodityType.name : '');

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const CommodityTypeInput: React.FC<Props> = ({ value, onChange, margin }, ref) => {
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
      options={commodityTypes}
      getOptionLabel={getCommodityTypeLabel}
      open={open}
      setOpen={setOpen}
      value={value}
      onChange={(commodityType: CommodityType | undefined) => onChange(commodityType)}
    />
  );
};

export default forwardRef(CommodityTypeInput);
