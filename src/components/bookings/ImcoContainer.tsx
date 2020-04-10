import React, { Fragment } from 'react';
import { TableRowData } from './ContainerDetails';
import { IMCOField } from '../../model/Booking';

interface Prop {
  detail: IMCOField;
}
const ImcoContainer: React.FC<Prop> = ({ detail }) => {
  return (
    <Fragment>
      <TableRowData label="IMCO" content={`${detail.IMOClass} / ${detail.UNNumber} / ${detail.PackingNumber}`} />
    </Fragment>
  );
};

export default ImcoContainer;
