import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { AlertType } from '../../model/Booking';
import { TaskDescription, TaskType } from '../../model/Task';
import Notification from '../../model/Notification';

interface Props {
  alert: Notification;
}

enum AlertText {
  DEPOT_OUT_PICK_UP = 'Not empty picked up yet.',
  FREIGHT = 'Freight is not checked in checklist.',
  GATE_OUT = 'Gate out terminal is not checked in checklist.',
  INVOICED = 'Invoiced is not checked in checklist.',
  S_I = 'Closing for shipping instructions is soon, please check booking.',
  VGM = 'Closing for VGM is soon, please check booking.',
}

const makeAlertText = (alert: AlertType) => {
  switch (alert) {
    case AlertType.DEPOT_OUT_PICK_UP:
      return AlertText.DEPOT_OUT_PICK_UP;
    case AlertType.FREIGHT:
      return AlertText.FREIGHT;
    case AlertType.GATE_OUT:
      return AlertText.GATE_OUT;
    case AlertType.INVOICED:
      return AlertText.INVOICED;
    case AlertType.S_I:
      return AlertText.S_I;
    case AlertType.VGM:
      return AlertText.VGM;
    default:
      return '';
  }
};

const makeTaskAlertText = (type: TaskType) => {
  return Object.entries(TaskDescription).find(t => t[0] === type)?.[1] || '-';
};

const Alert: React.FC<Props> = ({ alert }) => (
  <Box>
    <Typography>
      {alert.alertType ? makeAlertText(alert.alertType) : alert.taskType ? makeTaskAlertText(alert.taskType) : null}
    </Typography>
  </Box>
);

export default Alert;
