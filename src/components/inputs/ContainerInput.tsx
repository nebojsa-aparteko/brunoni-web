import React from 'react';
import set from 'lodash/fp/set';
import { Grid } from '@material-ui/core';
import { InputProps } from '../../model/InputProps';
import { Container } from '../../model/get-quotes/Container';
import ContainerTypeInput from './ContainerTypeInput';
import CommodityTypeInput from './CommodityTypeInput';
import QuantityInput from './QuantityInput';

interface Props extends InputProps<Container> {}

const ContainerInput: React.FC<Props> = ({ value, onChange }) => (
  <Grid container spacing={2}>
    <Grid item xs={4}>
      <ContainerTypeInput value={value.containerType} onChange={v => onChange(set('containerType', v)(value))} />
    </Grid>
    <Grid item xs={4}>
      <CommodityTypeInput value={value.commodityType} onChange={v => onChange(set('commodityType', v)(value))} />
    </Grid>
    <Grid item xs={4}>
      <QuantityInput value={value.quantity} onChange={v => onChange(set('quantity', v)(value))} />
    </Grid>
  </Grid>
);

export default ContainerInput;
