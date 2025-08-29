export {};

declare global {
  interface Window {
    $crisp: any;
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      settings?: {
        hideConsoleLogsInStrictMode?: boolean;
        [key: string]: any;
      };
      [key: string]: any;
    };
  }

  // Declare global variable so both TS and ESLint are aware of it
  var $crisp: any;
}
