'use client';
import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

export default function FadeImage({ alt, onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      {...props}
      alt={alt}
      data-loaded={loaded}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      ref={(node) => {
        if (node?.complete) setLoaded(true);
      }}
    />
  );
}
