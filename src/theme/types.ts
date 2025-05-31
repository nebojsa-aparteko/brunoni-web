import { Theme } from '@material-ui/core/styles';

export type ThemeFontWeight = 300 | 400 | 500 | 700;

export const createFontWeightStyle = (theme: Theme, weight: keyof Theme['typography']) => ({
  fontWeight: theme.typography[weight] as ThemeFontWeight,
});
