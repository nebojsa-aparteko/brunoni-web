export {};

declare global {
  interface Window {
    $crisp: any;
  }

  // Declare global variable so both TS and ESLint are aware of it
  var $crisp: any;
}
