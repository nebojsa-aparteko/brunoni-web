import React from 'react';
import { TaskAdditionalInfo, TaskAdditionalInfoType, TaskAdditionalInfoTypeDescription } from '../model/Task';
import formatDate from 'date-fns/format';
import safeInvoke from '../utilities/safeInvoke';
import { IconButton, Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';

const getAdditionalInfoText = (additionalInfo: TaskAdditionalInfo) => {
  if (additionalInfo.type === TaskAdditionalInfoType.AMS_CLOSING)
    return `${Object.entries(TaskAdditionalInfoTypeDescription).find(t => t[0] === additionalInfo?.type)?.[1] ||
      '-'} ${formatDate(safeInvoke('toDate')(additionalInfo.amsClosingDate), 'd. MMMM yyyy HH:mm')}`;
  if (additionalInfo.type === TaskAdditionalInfoType.ON_HOLD)
    return `${Object.entries(TaskAdditionalInfoTypeDescription).find(t => t[0] === additionalInfo?.type)?.[1] || '-'} `;
  return '-';
};

const TaskAdditionalInfoView: React.FC<Props> = ({ additionalInfo }) => (
  <Tooltip title={getAdditionalInfoText(additionalInfo)} aria-label="additionalInfo">
    <IconButton aria-label="additional-info" size="small">
      <InfoIcon style={{ color: '#F7BC06' }} />
    </IconButton>
  </Tooltip>
);

export default TaskAdditionalInfoView;

interface Props {
  additionalInfo: TaskAdditionalInfo;
}
