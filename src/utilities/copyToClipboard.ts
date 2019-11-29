import copy from 'copy-to-clipboard';

export enum ClipboardFormat {
  PLAINTEXT = 'text/plain',
  HTML = 'text/html',
  RTF = 'text/rtf',
}

export interface ClipboardData {
  format: ClipboardFormat;
  body: string;
}

const copyToClipboard = (
  data: ClipboardData[],
  failoverFormat: ClipboardFormat = ClipboardFormat.PLAINTEXT,
): boolean => {
  const clipboardCopyFunction = (evt: any) => {
    evt.preventDefault();
    data.map(clipboardData => {
      evt.clipboardData.setData(clipboardData.format, clipboardData.body);
    });
  };

  window.addEventListener('copy', clipboardCopyFunction);
  let result = document.execCommand('copy');
  window.removeEventListener('copy', clipboardCopyFunction);

  if (!result) {
    //do failover thingy
    const failoverObject = data.find(element => element.format === failoverFormat);

    result = copy(failoverObject ? failoverObject.body : 'Fail over body was empty', { format: failoverFormat });
  }

  return result;
};

export default copyToClipboard;
