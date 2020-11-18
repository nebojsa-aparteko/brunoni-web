import Shepherd from 'shepherd.js';

export let quoteShepherdTour: Shepherd.Tour = new Shepherd.Tour({
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
quoteShepherdTour.addSteps([
  {
    title: 'Book Now Button',
    text: 'Use this button to place a booking.',
    attachTo: { element: '#bookNowButtonQuote', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: quoteShepherdTour.next,
      },
    ],
  },
  {
    title: 'Print Option',
    text: 'Here you can print out the Quotation.',
    attachTo: { element: '#printQuote', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: quoteShepherdTour.next,
      },
    ],
  },
  {
    title: 'Special Requests',
    text: 'Here you can ask questions, e.g. Extra free time etc.',
    attachTo: { element: '#specialRequestQuote', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: quoteShepherdTour.next,
      },
    ],
  },
]);
