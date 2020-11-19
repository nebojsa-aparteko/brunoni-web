import Shepherd from 'shepherd.js';

export let scheduleShepherdTour: Shepherd.Tour = new Shepherd.Tour({
  useModalOverlay: true,
  exitOnEsc: true,
  defaultStepOptions: {
    arrow: false,
    classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: {
      enabled: true,
    },
  },
});
scheduleShepherdTour.addSteps([
  {
    title: 'Origin',
    text: 'Enter the origin you want to ship.',
    attachTo: { element: '#originSched', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: scheduleShepherdTour.next,
      },
    ],
  },
  {
    title: 'Destination',
    text: 'Enter the destination you want to ship.',
    attachTo: { element: '#destinationSched', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: scheduleShepherdTour.next,
      },
    ],
  },
  {
    title: 'Date',
    text: 'Enter date of shipment.',
    attachTo: { element: '#dateSched', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: scheduleShepherdTour.next,
      },
    ],
  },
  {
    title: 'Weeks',
    text: 'Enter range of shipping dates you need.',
    attachTo: { element: '#weeksSched', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: scheduleShepherdTour.next,
      },
    ],
  },
  {
    title: 'Offers',
    text: 'You can also select one of the special offers.',
    attachTo: { element: '#offersSched' },
    buttons: [
      {
        text: 'Next',
        action: scheduleShepherdTour.next,
      },
    ],
  },
  {
    title: 'Help',
    text: 'If needed, you can start the guide again at any moment by clicking on this button.',
    attachTo: { element: '#helpButtonNav', on: 'bottom' },
    buttons: [
      {
        text: 'Finish',
        action: scheduleShepherdTour.next,
      },
    ],
  },
]);
