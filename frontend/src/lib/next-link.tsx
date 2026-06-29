import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export default function Link({ href, children, className, style, ...props }: any) {
  // Map href to react-router to parameter
  return (
    <RouterLink to={href} className={className} style={style} {...props}>
      {children}
    </RouterLink>
  );
}
