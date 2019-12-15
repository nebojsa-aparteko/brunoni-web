export default (input: HTMLInputElement) => {
  setTimeout(() => {
    input.focus();
    input.setSelectionRange(0, input.value.length);
  });
};
