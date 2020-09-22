import React from 'react';
import { TaskAdditionalInfo, TaskAdditionalInfoTypeDescription } from '../model/Task';
import formatDate from 'date-fns/format';
import safeInvoke from '../utilities/safeInvoke';
import { IconButton, Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';

const TaskAdditionalInfoView: React.FC<Props> = ({ additionalInfo }) => (
  <Tooltip
    title={`${Object.entries(TaskAdditionalInfoTypeDescription).find(t => t[0] === additionalInfo?.type)?.[1] ||
      '-'} ${formatDate(safeInvoke('toDate')(additionalInfo.amsClosingDate), 'd. MMMM yyyy')}`}
    aria-label="additionalInfo"
  >
    <IconButton aria-label="additional-info" size="small">
      <InfoIcon style={{ color: '#F7BC06' }} />
    </IconButton>
  </Tooltip>
);

export default TaskAdditionalInfoView;

interface Props {
  additionalInfo: TaskAdditionalInfo;
}
