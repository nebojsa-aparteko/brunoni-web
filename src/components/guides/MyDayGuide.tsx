import Shepherd from 'shepherd.js';

export let myDayShepherdTour: Shepherd.Tour = new Shepherd.Tour({
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
myDayShepherdTour.addSteps([
  {
    title: 'Task description',
    text: 'Description of the task - what needs to be done.',
    attachTo: { element: '#taskDescriptionMyDay', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: myDayShepherdTour.next,
      },
    ],
  },
  {
    title: 'Due Date',
    text: 'Gives you date and time until when the task has to be done.',
    attachTo: { element: '#dueDateMyDay', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: myDayShepherdTour.next,
      },
    ],
  },
  {
    title: 'Task Status',
    text: 'Status indicates whether task is still pending or overdue.',
    attachTo: { element: '#taskStatusMyDay', on: 'bottom' },
    buttons: [
      {
        text: 'Next',
        action: myDayShepherdTour.next,
      },
    ],
  },
]);
