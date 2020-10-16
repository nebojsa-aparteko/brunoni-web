import React from 'react';
import Shepherd from 'shepherd.js';
import { Button, Typography } from '@material-ui/core';
import 'shepherd.js/dist/css/shepherd.css';

let shepherdTour: Shepherd.Tour = new Shepherd.Tour({
  useModalOverlay: true,
  exitOnEsc: true,
  defaultStepOptions: {
    arrow: false,
    classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
    scrollTo: { behavior: 'smooth', block: 'center' },
    modalOverlayOpeningPadding: 4,
  },
});
shepherdTour.addSteps([
  {
    title: 'Step 1 of 2',
    text: 'Here we can see the booking summary.',
    attachTo: { element: '.bookingSummary', on: 'right' },
    buttons: [
      {
        text: 'Next',
        action: shepherdTour.next,
      },
    ],
  },
  {
    title: 'Step 2 of 2',
    text: 'This segment shows you all available information about the containers that are a part of the booking.',
    attachTo: { element: '.bookingContainerDetails', on: 'right' },
    buttons: [
      {
        text: 'Finish tour',
        action: shepherdTour.next,
      },
    ],
  },
]);

const TourButton = () => {
  return (
    <Button onClick={shepherdTour.start}>
      <Typography>Start Tour</Typography>
    </Button>
  );
};

export default TourButton;
