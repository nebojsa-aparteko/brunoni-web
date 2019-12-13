import Port from '../model/Port';

export const portShortFormatLabel = (port: Port | undefined) => port?.city || port?.id || '?';

export const portLongFormatLabel = (port: Port | undefined) =>
  port?.city ? port?.city || '?' + ', ' + port?.country || '?' : port ? port.id : '?';
