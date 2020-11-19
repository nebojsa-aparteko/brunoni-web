import Shepherd from 'shepherd.js';

export let navbarShepherdTour: Shepherd.Tour = new Shepherd.Tour({
  useModalOverlay: true,
  exitOnEsc: true,
  defaultStepOptions: {
    arrow: false,
    classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
    scrollTo: { behavior: 'smooth', block: 'center' },
    modalOverlayOpeningPadding: 4,
    cancelIcon: {
      enabled: true,
    },
  },
});
navbarShepherdTour.addSteps([
  {
    title: 'Dashboard',
    text:
      'Here you will find statistics that show your performance with us. You can see the numbers from this year and the years before. On company/branch level.',
    attachTo: { element: '#dashboardNav', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: navbarShepherdTour.next,
      },
    ],
  },
  {
    title: 'Schedule',
    text: 'Get the schedule and you will also find space information, closings and terminals.',
    attachTo: { element: '#scheduleNav', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: navbarShepherdTour.next,
      },
    ],
  },
  {
    title: 'Quotes',
    text:
      'This is the overview of all quotations that were created via the platform or manually via E-Mail. Here you can also see the quotes from your colleagues in the company.',
    attachTo: { element: '#quotesNav', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: navbarShepherdTour.next,
      },
    ],
  },
  {
    title: 'My Day',
    text:
      'Platform needs action from you! In this section you can check tasks that are assigned to you, and resolve them for example: Arranging VGM submission, Submitting Shipping instructions etc. The most efficient way to plan your day!',
    attachTo: { element: '#myDayNav', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: navbarShepherdTour.next,
      },
    ],
  },
  {
    title: 'Bookings',
    text:
      'This is the overview of all bookings that were created via the platform or manually via E-Mail. Here you can also see the bookings from your colleagues in the company.',
    attachTo: { element: '#bookingsNav', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: navbarShepherdTour.next,
      },
    ],
  },
  {
    title: 'Open Menu',
    text: 'Click the "Other" button to open the menu and then press next.',
    attachTo: { element: '#otherMenuNav', on: 'left' },
    buttons: [
      {
        text: 'Next',
        action: navbarShepherdTour.next,
      },
    ],
  },
  {
    title: 'Equipment Situation',
    text: 'An accurate overview of the current equipment situation.',
    attachTo: { element: '#equipmentSituationNav', on: 'right' },
    buttons: [
      {
        text: 'Next',
        action: navbarShepherdTour.next,
      },
    ],
  },
  {
    title: 'Side charges',
    text: 'Overview of all side charges in import, export and crosstrade.',
    attachTo: { element: '#sideChargesNav', on: 'right' },
    buttons: [
      {
        text: 'Next',
        action: navbarShepherdTour.next,
      },
    ],
  },
  {
    title: 'Get Quote',
    text: 'This is the fastest way to get a competitive quote. 24/7. Use it, you will love it!',
    attachTo: { element: '#getQuoteNav', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: navbarShepherdTour.next,
      },
    ],
  },
  {
    title: 'Quick Search',
    text: 'The fastest way to find your shipment on the platform. Use it and save time!',
    attachTo: { element: '#quickSearchNav', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: navbarShepherdTour.next,
      },
    ],
  },
  {
    title: 'Notifications',
    text:
      'Here you get business-relevant information so that your shipment can be processed smoothly. You will also find messages from our customer service here.',
    attachTo: { element: '#notificationsNav', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: navbarShepherdTour.next,
      },
    ],
  },
  {
    title: 'Open User Menu',
    text: 'Click the user menu button to open the menu and then press next.',
    attachTo: { element: '#identityWidgetNav', on: 'left' },
    buttons: [
      {
        text: 'Next',
        action: navbarShepherdTour.next,
      },
    ],
  },
  {
    title: 'My Profile',
    text: 'Here you see your profile details and activate vacation mode.',
    attachTo: { element: '#myProfileNav', on: 'right' },
    buttons: [
      {
        text: 'Next',
        action: navbarShepherdTour.next,
      },
    ],
  },
  {
    title: 'Log Out',
    text:
      "No need to log out. Just close the window and stay logged in. If needed, just open MyBrunoni.ch / MyAllmarine.ch and you are online. You don't have to log in every time. Awesome isn't it?",
    attachTo: { element: '#logOutNav', on: 'right' },
    buttons: [
      {
        text: 'Finish tour',
        action: navbarShepherdTour.next,
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
        action: navbarShepherdTour.next,
      },
    ],
  },
]);
