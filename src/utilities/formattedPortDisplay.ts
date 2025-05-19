import Port from '../model/Port';
import { Quote, QuoteGroup } from '../providers/QuoteGroupsProvider';

export const portShortFormatLabel = (port: Port | undefined): string =>
  port?.city || port?.id || '?';

export const portLongFormatLabel = (port: Port | undefined): string =>
  port?.city ? port?.city || `?, ${port?.country}` || '?' : port ? port.id : '?';

export const quoteRouteLabelDisplay = (
  quote: Quote | QuoteGroup | undefined,
  shortFormat: boolean = false,
) => {
  return quote
    ? (quote.placeOfReceiptName
        ? quote.placeOfReceiptName
        : shortFormat
          ? portShortFormatLabel(quote.origin)
          : portLongFormatLabel(quote.origin)) +
        ' → ' +
        (quote.placeOfDeliveryName
          ? quote.placeOfDeliveryName
          : shortFormat
            ? portShortFormatLabel(quote.destination)
            : portLongFormatLabel(quote.destination))
    : '?';
};
