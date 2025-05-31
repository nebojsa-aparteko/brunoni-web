import React, { useMemo } from 'react';
import isArray from 'lodash/fp/isArray';
import { Skeleton } from '@material-ui/lab';

const TextSkeleton: React.FC<{ width: number | [number, number] }> = ({ width }) => {
  const actualWidth = useMemo(
    () => (isArray(width) ? Math.random() * (width[1] - width[0]) + width[1] : width),
    [width],
  );
  return (
    <Skeleton
      component="span"
      width={actualWidth}
      height={16}
      style={{ margin: 0, marginTop: 2, marginBottom: 2 }}
    />
  );
};

export default TextSkeleton;
