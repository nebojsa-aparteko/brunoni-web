import Shepherd from 'shepherd.js';

export let quotesGroupShepherdTour: Shepherd.Tour = new Shepherd.Tour({
  useModalOverlay: true,
  exitOnEsc: true,
  defaultStepOptions: {
    arrow: false,
    classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: {
      enabled: true,
    },
    modalOverlayOpeningPadding: 4,
  },
});
quotesGroupShepherdTour.addSteps([
  {
    title: 'Quote Options',
    text:
      'Here you can see which carriers we can offer your requested route. Disclaimer: Please note that the maintenance of the data is carried out independently by different people.',
    attachTo: { element: '#optionsQuoteGroup', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: quotesGroupShepherdTour.next,
      },
    ],
  },
  {
    title: 'Assigned admin',
    text: 'This is the assign sales person who will assist you.',
    attachTo: { element: '#assignedAdminQuoteGroup', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: quotesGroupShepherdTour.next,
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
        action: quotesGroupShepherdTour.next,
      },
    ],
  },
]);
