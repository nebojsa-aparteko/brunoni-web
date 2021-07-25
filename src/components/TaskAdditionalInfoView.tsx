import React from 'react';
import { TaskAdditionalInfo, TaskAdditionalInfoType, TaskAdditionalInfoTypeDescription } from '../model/Task';
import formatDate from 'date-fns/format';
import safeInvoke from '../utilities/safeInvoke';
import { Box, IconButton, Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import Icon from '@mdi/react';
import { mdiStar } from '@mdi/js';

const getAdditionalInfoText = (additionalInfo: TaskAdditionalInfo) => {
  if (additionalInfo.type === TaskAdditionalInfoType.AMS_CLOSING)
    return `${Object.entries(TaskAdditionalInfoTypeDescription).find(t => t[0] === additionalInfo?.type)?.[1] ||
      '-'} ${formatDate(safeInvoke('toDate')(additionalInfo.amsClosingDate), 'd. MMMM yyyy HH:mm')}`;
  if (additionalInfo.type === TaskAdditionalInfoType.ON_HOLD)
    return `${Object.entries(TaskAdditionalInfoTypeDescription).find(t => t[0] === additionalInfo?.type)?.[1] || '-'} `;
  if (additionalInfo.type === TaskAdditionalInfoType.BOOKING_HAS_PINNED_COMMENTS)
    return 'This booking has pinned comments';
  return '-';
};

interface BadgeProps {
  additionalInfo: TaskAdditionalInfo;
}

const AdditionalInfoBadge: React.FC<BadgeProps> = ({ additionalInfo }) => (
  <Tooltip title={getAdditionalInfoText(additionalInfo)} aria-label="additionalInfo">
    <IconButton aria-label="additional-info" size="small">
      {additionalInfo.type === TaskAdditionalInfoType.BOOKING_HAS_PINNED_COMMENTS ? (
        <span>
          <Icon path={mdiStar} size={0.8} color="orange" style={{ position: 'relative', top: 4 }} />
        </span>
      ) : (
        <InfoIcon style={{ color: '#F7BC06' }} />
      )}
    </IconButton>
  </Tooltip>
);

const TaskAdditionalInfoView: React.FC<Props> = ({ additionalInfo }) => (
  <Box>
    {Array.isArray(additionalInfo) ? (
      additionalInfo.map((info, i) => <AdditionalInfoBadge key={`${info.type}-${i}`} additionalInfo={info} />)
    ) : (
      <AdditionalInfoBadge additionalInfo={additionalInfo} />
    )}
  </Box>
);

export default TaskAdditionalInfoView;

interface Props {
  additionalInfo: TaskAdditionalInfo[] | TaskAdditionalInfo;
}
