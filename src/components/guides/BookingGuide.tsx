import Shepherd from 'shepherd.js';

export let bookingShepherdTour: Shepherd.Tour = new Shepherd.Tour({
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
bookingShepherdTour.addSteps([
  {
    title: 'Booking Summary',
    text: 'This is the where you can find the most commonly needed information.',
    attachTo: { element: '#bookingSummaryBkg', on: 'right' },
    buttons: [
      {
        text: 'Next',
        action: bookingShepherdTour.next,
      },
    ],
  },
  {
    title: 'Equipment',
    text: 'Here you can see the details about the equipment.',
    attachTo: { element: '#equipmentDetailsBkg', on: 'right' },
    buttons: [
      {
        text: 'Next',
        action: bookingShepherdTour.next,
      },
    ],
  },
  {
    title: 'Other Booking Information',
    text: 'This is where you can see the rest of the booking information such as freight details and if available, port terms.',
    attachTo: { element: '#otherBookingInfoBkg', on: 'right' },
    buttons: [
      {
        text: 'Next',
        action: bookingShepherdTour.next,
      },
    ],
  },
  {
    title: 'Checklist',
    text: 'This is the checklist where you can see the current status of the booking.',
    attachTo: { element: '#cardChecklist', on: 'left' },
    buttons: [
      {
        text: 'Next',
        action: bookingShepherdTour.next,
      },
    ],
  },
  {
    title: 'Attach files',
    text: 'You can upload documents by dragging them onto the desired item or by clicking on the paperclip icon. As soon as this has been done, it triggers a task for us, which is immediately processed by our team.',
    attachTo: { element: '#checklistItemRow_SHIPPING_INSTRUCTIONS', on: 'left' },
    buttons: [
      {
        text: 'Next',
        action: bookingShepherdTour.next,
      },
    ],
  },
  {
    title: 'Mention item/document',
    text: 'You can mention a checklist item or Document by clicking this icon.',
    attachTo: { element: '#mentionIconChecklist', on: 'left' },
    buttons: [
      {
        text: 'Next',
        action: bookingShepherdTour.next,
      },
    ],
  },
  {
    title: 'Activity log',
    text: 'Here you can see the activity for this booking.',
    attachTo: { element: '#activityLog', on: 'left' },
    buttons: [
      {
        text: 'Next',
        action: bookingShepherdTour.next,
      },
    ],
  },
  {
    title: 'Comment',
    text: 'Here you can drop a comment and the customer service will respond as soon as possible.',
    attachTo: { element: '#commentInputField', on: 'left' },
    buttons: [
      {
        text: 'Next',
        action: bookingShepherdTour.next,
      },
    ],
  },
  {
    title: 'Mention',
    text: 'With @name of the operator, you can notify the person involved.',
    attachTo: { element: '#commentInputField', on: 'left' },
    buttons: [
      {
        text: 'Next',
        action: bookingShepherdTour.next,
      },
    ],
  },
  {
    title: 'Action Log Activity Toggle',
    text: 'When enabled, all activities will be visible in the activity log, not just the comments.',
    attachTo: { element: '#activityToggleActivityLog', on: 'left' },
    buttons: [
      {
        text: 'Next',
        action: bookingShepherdTour.next,
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
        action: bookingShepherdTour.next,
      },
    ],
  },
]);
