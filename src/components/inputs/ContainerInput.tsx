import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import set from 'lodash/fp/set';
import { Box, Grid } from '@material-ui/core';
import InputProps from '../../model/InputProps';
import Container from '../../model/Container';
import ContainerTypeInput from './ContainerTypeInput';
import CommodityTypeInput from './CommodityTypeInput';
import QuantityInput from './QuantityInput';
import LocationInput from './LocationInput';
import ContainerType from '../../model/ContainerType';
import CommodityType from '../../model/CommodityType';
import PickupLocation from '../../model/PickupLocation';
import OptionalInput from './OptionalInput';
import ListInput from './ListInput';
import IMOInput from './IMOInput';
import OOGInput from './OOGInput';
import IMO from '../../model/IMO';
import OOG from '../../model/OOG';
import ContainerDetails from '../../model/ContainerDetails';

interface Props extends InputProps<Container & ContainerDetails> {}

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

  const handleIMOChange = (v: [false] | [true, IMO[]]) => {
    onChange(set('imo', v)(value));
  };

  const handleOOGChange = (v: [false] | [true, OOG[]]) => {
    onChange(set('oog', v)(value));
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <ContainerTypeInput
            ref={containerTypeInput}
            value={value.containerType}
            onChange={handleContainerTypeChange}
          />
        </Grid>
        <Grid item xs={3}>
          <CommodityTypeInput
            ref={commodityTypeInput}
            value={value.commodityType}
            onChange={handleCommodityTypeChange}
          />
        </Grid>
        <Grid item xs={4}>
          <LocationInput ref={locationInput} value={value.location} onChange={handleLocationChange} />
        </Grid>
        <Grid item xs={2}>
          <QuantityInput value={value.quantity} onChange={handleQuantityChange} />
        </Grid>
      </Grid>
      <OptionalInput
        label="This container contains IMO"
        ItemInput={props => <ListInput ItemInput={IMOInput} defaultItemValue={{}} {...props} />}
        defaultItemValue={[]}
        value={value.imo}
        onChange={handleIMOChange}
      />
      <OptionalInput
        label="This container is out of gauge"
        ItemInput={props => <ListInput ItemInput={OOGInput} defaultItemValue={{}} {...props} />}
        defaultItemValue={[]}
        value={value.oog}
        onChange={handleOOGChange}
      />
    </Box>
  );
};

export default forwardRef(ContainerInput);
