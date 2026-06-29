import React from 'react';

export default function Image({ src, alt, className, fill, width, height, style, ...props }: any) {
  const fillStyles: React.CSSProperties = fill
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        width: '100%',
      }
    : {};

  return (
    <img
      src={src}
      alt={alt || ''}
      className={className}
      width={width}
      height={height}
      style={{ ...fillStyles, ...style }}
      {...props}
    />
  );
}
