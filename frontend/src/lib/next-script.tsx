import React, { useEffect } from 'react';

export default function Script({ src, onLoad }: any) {
  useEffect(() => {
    if (!src) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    if (onLoad) {
      script.onload = onLoad;
    }
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [src, onLoad]);

  return null;
}
