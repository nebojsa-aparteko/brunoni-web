import Shepherd from 'shepherd.js';

export let bookingsTableShepherdTour: Shepherd.Tour = new Shepherd.Tour({
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
bookingsTableShepherdTour.addSteps([
  {
    title: 'Tabs - Active, History',
    text: 'As soon as a shipment has been successfully processed and all tasks have been completed, it is visible in the history.',
    attachTo: { element: '#tabsBkgPage', on: 'right' },
    buttons: [
      {
        text: 'Next',
        action: bookingsTableShepherdTour.next,
      },
    ],
  },
  {
    title: 'Export-Import',
    text: 'Choose if you want to see your Export or Import/Crosstrade shipment.',
    attachTo: { element: '#exportImportBkgView', on: 'right' },
    buttons: [
      {
        text: 'Next',
        action: bookingsTableShepherdTour.next,
      },
    ],
  },
  {
    title: 'Booking Summary',
    text: 'Here you can see the booking summary. Clicking on it will redirect you to the detailed booking view.',
    attachTo: { element: '#bookingSummaryBkgTable', on: 'top' },
    buttons: [
      {
        text: 'Next',
        action: bookingsTableShepherdTour.next,
      },
    ],
  },
  {
    title: 'Booking Progress',
    text: 'By clicking on the progress bar you can see the detailed progress of the booking.',
    attachTo: { element: '#bookingProgressBkgTable', on: 'left' },
    buttons: [
      {
        text: 'Next',
        action: bookingsTableShepherdTour.next,
      },
    ],
    modalOverlayOpeningPadding: 8,
  },
  {
    title: 'Help',
    text: 'If needed, you can start the guide again at any moment by clicking on this button.',
    attachTo: { element: '#helpButtonNav', on: 'bottom' },
    buttons: [
      {
        text: 'Finish',
        action: bookingsTableShepherdTour.next,
      },
    ],
  },
]);
