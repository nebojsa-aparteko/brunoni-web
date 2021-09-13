import palette from '../palette';
import typography from '../typography';
import { spacing } from '../spacing';

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
    paddingLeft: spacing(1),
    paddingRight: spacing(1),
    '@media print': {
      padding: 0,
    },
  },
};
