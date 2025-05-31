import React from 'react';
import { Mention as BaseMention, MentionProps } from 'react-mentions';

// Cast the component to ensure type compatibility with React 17
export const Mention = BaseMention as unknown as React.FC<MentionProps>;
