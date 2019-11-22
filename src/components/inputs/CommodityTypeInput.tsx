import React, { useContext, useState } from 'react';
import { InputProps } from '../../model/InputProps';
import CommodityTypes from '../../contexts/CommodityTypes';
import { CommodityType } from '../../model/get-quotes/CommodityType';
import SelectInput from './SelectInput';

interface Props extends InputProps<CommodityType | undefined> {}

const getCommodityTypeLabel = (commodityType: CommodityType | undefined) =>
  commodityType ? commodityType.CommodityText : '';

const CommodityTypeInput: React.FC<Props> = ({ value, onChange }) => {
  const commodityTypes = useContext(CommodityTypes);
  const [open, setOpen] = useState(false);

  return (
    <SelectInput
      options={commodityTypes}
      getOptionLabel={getCommodityTypeLabel}
      open={open}
      setOpen={setOpen}
      value={value}
      onChange={(commodityType: CommodityType | undefined) => onChange(commodityType)}
    />
  );
};

export default CommodityTypeInput;
