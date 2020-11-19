import Shepherd from 'shepherd.js';

export let quotesShepherdTour: Shepherd.Tour = new Shepherd.Tour({
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
quotesShepherdTour.addSteps([
  {
    title: 'Origin',
    text: 'Enter the origin you want to search.',
    attachTo: { element: '#originQuotes', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: quotesShepherdTour.next,
      },
    ],
  },
  {
    title: 'Destination',
    text: 'Enter the destination you want to search.',
    attachTo: { element: '#destinationQuotes', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: quotesShepherdTour.next,
      },
    ],
  },
  {
    title: 'Get Quote',
    text: 'This is the fastest way to get a competitive quote. 24/7. Use it, you will love it!',
    attachTo: { element: '#getQuoteQuotes', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: quotesShepherdTour.next,
      },
    ],
  },
  {
    title: 'Search input',
    text: 'Search by origin, destination or quote number.',
    attachTo: { element: '#searchQuotes', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: quotesShepherdTour.next,
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
        action: quotesShepherdTour.next,
      },
    ],
  },
]);
