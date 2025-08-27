export const showCrispChat = (show: boolean) => {
  try {
    $crisp.push(['do', show ? 'chat:show' : 'chat:hide']);
  } catch (e) {
    console.warn('Failed to push crisp command.');
  }
};
