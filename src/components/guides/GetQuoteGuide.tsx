import Shepherd from 'shepherd.js';

export let getQuotesShepherdTour: Shepherd.Tour = new Shepherd.Tour({
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
getQuotesShepherdTour.addSteps([
  {
    title: 'Origin',
    text: 'Enter the origin you need.',
    attachTo: { element: '#originGetQuote', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: getQuotesShepherdTour.next,
      },
    ],
  },
  {
    title: 'Destination',
    text: 'Enter the destination you need.',
    attachTo: { element: '#destinationGetQuote', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: getQuotesShepherdTour.next,
      },
    ],
  },
  {
    title: 'Earliest Date',
    text: 'Enter the shipping date you need.',
    attachTo: { element: '#earliestDateGetQuote', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: getQuotesShepherdTour.next,
      },
    ],
  },
  {
    title: 'Weeks',
    text: 'Enter the range of shipping dates you need.',
    attachTo: { element: '#weeksGetQuote', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: getQuotesShepherdTour.next,
      },
    ],
  },
  {
    title: 'Add Cargo',
    text:
      'Use this option to choose Equipment type, Commodity and Quantity. If more than one equipment type is involved, use it several times so that the details can be captured in one quote.',
    attachTo: { element: '#addCargoGetQuote', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: getQuotesShepherdTour.next,
      },
    ],
  },
  {
    title: 'Request',
    text: 'Use this button to Get Quote once all details are entered.',
    attachTo: { element: '#requestGetQuote', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: getQuotesShepherdTour.next,
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
        action: getQuotesShepherdTour.next,
      },
    ],
  },
]);
