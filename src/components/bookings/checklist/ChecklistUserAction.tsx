import React from 'react';
import { Link, Typography } from '@material-ui/core';
import { Booking, CarrierId } from '../../../model/Booking';
import { ChecklistItem, CustomerChecklistActionType } from './ChecklistItemModel';

const getFormLink = (carrierId: any): string => {
  switch (carrierId) {
    case CarrierId.ALIANCA:
      return 'https://www.hamburgsud-line.com/liner/en/liner_services/ecommerce/verified_gross_mass_ecommerce/index.html';
    case CarrierId.HAMBURG_SUD:
      return 'https://www.hamburgsud-line.com/liner/de/liner_services/ecommerce/verified_gross_mass_ecommerce/index.html';
    case CarrierId.HMM:
      return 'http://www.hmm21.com/cms/business/ebiz/export/vgmWithoutLogin/index.jsp';
    case CarrierId.MACS:
      return 'https://www.macship.com/E-BUSINESS/SolasAccess.aspx';
    case CarrierId.ZIM:
      return 'https://www.zim.com/tools/solas-vgm';
    case CarrierId.DEUTSCHE_AFRIKA:
      return 'https://my.dal.biz/vgm#/login';
    default:
      return '#';
  }
};

const ChecklistUserActionForm = ({ link }: FormProps) =>
  link !== '#' ? (
    <Typography>
      Please fill{' '}
      <Link href={link} target="_blank">
        this
      </Link>{' '}
      form, and mark completed when done
    </Typography>
  ) : (
    <Typography> Please upload documents here.</Typography>
  );

const ChecklistUserActionUploadFile = () => <Typography> Please upload file here.</Typography>;

const ChecklistUserAction = ({ booking, checklistItem }: Props) => {
  const action = checklistItem.customerAction?.action;

  switch (action) {
    case CustomerChecklistActionType.fillForm:
      return <ChecklistUserActionForm link={getFormLink(booking?.CarrierID)} />;
    case CustomerChecklistActionType.uploadFile:
      return <ChecklistUserActionUploadFile />;
    default:
      return null;
  }
};

export default ChecklistUserAction;

export interface Props {
  booking: Booking;
  checklistItem: ChecklistItem;
}
export interface FormProps {
  link: string;
}
