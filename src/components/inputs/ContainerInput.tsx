import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import set from 'lodash/fp/set';
import { Grid } from '@material-ui/core';
import InputProps from '../../model/InputProps';
import Container from '../../model/Container';
import ContainerTypeInput from './ContainerTypeInput';
import CommodityTypeInput from './CommodityTypeInput';
import QuantityInput from './QuantityInput';
import LocationInput from './LocationInput';
import ContainerType from '../../model/ContainerType';
import CommodityType from '../../model/CommodityType';
import PickupLocation from '../../model/PickupLocation';

interface Props extends InputProps<Container> {}

const ContainerInput: React.FC<Props> = ({ value, onChange }, ref) => {
  const containerTypeInput = useRef();
  const commodityTypeInput = useRef();
  const locationInput = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (!value.containerType) {
        (containerTypeInput.current! as { focus: () => void }).focus();
      } else if (!value.commodityType) {
        (commodityTypeInput.current! as { focus: () => void }).focus();
      } else if (!value.location) {
        (locationInput.current! as { focus: () => void }).focus();
      } else {
        (containerTypeInput.current! as { focus: () => void }).focus();
      }
    },
  }));

  const handleContainerTypeChange = (v: ContainerType | undefined) => {
    onChange(set('containerType', v)(value));
    (commodityTypeInput.current! as { focus: () => void }).focus();
  };

  const handleCommodityTypeChange = (v: CommodityType | undefined) => {
    onChange(set('commodityType', v)(value));
    (locationInput.current! as { focus: () => void }).focus();
  };

  const handleLocationChange = (v: PickupLocation | undefined) => {
    onChange(set('location', v)(value));
  };

  const handleQuantityChange = (v: number) => {
    onChange(set('quantity', v)(value));
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <ContainerTypeInput ref={containerTypeInput} value={value.containerType} onChange={handleContainerTypeChange} />
      </Grid>
      <Grid item xs={3}>
        <CommodityTypeInput ref={commodityTypeInput} value={value.commodityType} onChange={handleCommodityTypeChange} />
      </Grid>
      <Grid item xs={4}>
        <LocationInput ref={locationInput} value={value.location} onChange={handleLocationChange} />
      </Grid>
      <Grid item xs={2}>
        <QuantityInput value={value.quantity} onChange={handleQuantityChange} />
      </Grid>
    </Grid>
  );
};

export default forwardRef(ContainerInput);
