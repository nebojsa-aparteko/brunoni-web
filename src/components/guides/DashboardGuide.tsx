import Shepherd from 'shepherd.js';

export let dashboardShepherdTour: Shepherd.Tour = new Shepherd.Tour({
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
dashboardShepherdTour.addSteps([
  {
    title: 'Date chooser',
    text: 'Date chooser to see your performance in this year and the years before.',
    attachTo: { element: '#dateDash', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: dashboardShepherdTour.next,
      },
    ],
  },
  {
    title: 'TEU Performance',
    text: 'Number of TEU performed.',
    attachTo: { element: '#TEUPerformanceDash', on: 'right' },
    buttons: [
      {
        text: 'Next',
        action: dashboardShepherdTour.next,
      },
    ],
  },
  {
    title: 'Share per Carrier',
    text: 'Performance share in TEU per Carrier.',
    attachTo: { element: '#sharePerCarrierDash', on: 'left' },
    buttons: [
      {
        text: 'Next',
        action: dashboardShepherdTour.next,
      },
    ],
  },
  {
    title: 'Container Types',
    text: 'Performance share per Container types.',
    attachTo: { element: '#containerTypePerformanceDash', on: 'right' },
    buttons: [
      {
        text: 'Next',
        action: dashboardShepherdTour.next,
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
        action: dashboardShepherdTour.next,
      },
    ],
  },
]);
