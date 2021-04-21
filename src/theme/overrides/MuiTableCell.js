import palette from '../palette';
import typography from '../typography';

export default {
  root: {
    ...typography.body1,
    borderBottom: `1px solid ${palette.divider}`,
    '@media print': {
      fontSize: '10px',
    },
  },
  sizeSmall: {
    color: '#000', // TODO get this from theme
    lineHeight: 1,
    paddingLeft: '1em',
    paddingRight: '1em',
    '@media print': {
      padding: 0,
    },
  },
};
