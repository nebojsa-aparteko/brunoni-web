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
  {
    title: 'Activity log',
    text: 'Here you can see the activity for this quote.',
    attachTo: { element: '#activityLog', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: quoteShepherdTour.next,
      },
    ],
  },
  {
    title: 'Comment',
    text: 'Here you can drop a comment and the customer service will respond as soon as possible.',
    attachTo: { element: '#commentInputField', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: quoteShepherdTour.next,
      },
    ],
  },
  {
    title: 'Mention',
    text: 'With @name of the operator, you can notify the person involved.',
    attachTo: { element: '#commentInputField', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: quoteShepherdTour.next,
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
        action: quoteShepherdTour.next,
      },
    ],
  },
]);
