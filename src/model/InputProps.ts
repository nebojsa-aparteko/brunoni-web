import React from 'react';

export interface InputProps<T> {
  ref?: React.Ref<unknown>;
  value: T;
  onChange: (value: T) => void;
}
