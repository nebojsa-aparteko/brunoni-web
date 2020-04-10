import React from 'react';

export default interface InputProps<T> {
  ref?: React.Ref<unknown>;
  value: T;
  onChange: (value: T | null) => void;
}
