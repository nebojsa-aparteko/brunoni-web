import * as React from 'react';
import { ElementType } from 'react';

declare module '@material-ui/core' {
  interface ButtonBaseTypeMap<P = {}, D extends ElementType = 'button'> {
    props: P & {
      component?: D;
    };
    defaultComponent: D;
  }

  interface ButtonTypeMap<P = {}, D extends ElementType = 'button'> {
    props: P & {
      component?: D;
    };
    defaultComponent: D;
  }

  interface IconButtonTypeMap<P = {}, D extends ElementType = 'button'> {
    props: P & {
      component?: D;
    };
    defaultComponent: D;
  }

  interface MenuItemTypeMap<P = {}, D extends ElementType = 'li'> {
    props: P & {
      component?: D;
    };
    defaultComponent: D;
  }

  interface ButtonProps {
    component?: React.ElementType;
  }
  interface IconButtonProps {
    component?: React.ElementType;
  }
  interface MenuItemProps {
    component?: React.ElementType;
  }
}

declare module '@material-ui/core/styles/createMixins' {
  interface Mixins {
    gutters: (styles?: any) => any;
    toolbar: {
      minHeight: number;
      '@media (min-width:0px) and (orientation: landscape)': {
        minHeight: number;
      };
      '@media (min-width:600px)': {
        minHeight: number;
      };
    };
  }
}

declare module '@material-ui/core/styles/createPalette' {
  interface TypeBackground {
    default: string;
    paper: string;
    level1: string;
    level2: string;
  }
}

declare module '@material-ui/core/styles/createTypography' {
  interface Typography {
    fontWeightLight: number;
    fontWeightRegular: number;
    fontWeightMedium: number;
    fontWeightBold: number;
  }

  interface TypographyOptions {
    fontWeightLight?: number;
    fontWeightRegular?: number;
    fontWeightMedium?: number;
    fontWeightBold?: number;
  }
}

declare module '@material-ui/core/styles' {
  interface StyleRules {
    [key: string]: React.CSSProperties | (() => React.CSSProperties);
  }
}

declare module '@material-ui/core/styles/createTheme' {
  interface Theme {
    mixins: Mixins;
  }
  interface ThemeOptions {
    mixins?: Partial<Mixins>;
  }
}

declare module 'react-mentions' {
  import * as React from 'react';

  export interface MentionItem {
    id: string | number;
    display: string;
    [key: string]: any;
  }

  interface MentionsInputProps {
    value?: string;
    onChange?: (
      event: { target: { value: string } },
      newValue: string,
      newPlainTextValue: string,
      mentions: MentionItem[],
    ) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    classNames?: { [key: string]: string };
    style?: React.CSSProperties;
    singleLine?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  }

  interface MentionProps {
    trigger?: string;
    data: MentionItem[] | ((search: string) => Promise<MentionItem[]>);
    renderSuggestion?: (
      suggestion: MentionItem,
      search: string,
      highlightedDisplay: React.ReactNode,
      index: number,
      focused: boolean,
    ) => React.ReactNode;
    markup?: string;
    displayTransform?: (id: string, display: string) => string;
    [key: string]: any;
  }

  export const MentionsInput: React.FC<MentionsInputProps>;
  export const Mention: React.ComponentType<MentionProps>;
}
