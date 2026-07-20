import React, { useEffect, useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { api } from '@/services/api';
import { Loader2 } from 'lucide-react';

interface AuthorizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
}

export const AuthorizedImage = ({ src, alt, className, ...props }: AuthorizedImageProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    let url: string | null = null;

    const fetchImage = async () => {
      try {
        setLoading(true);
        // We use our authenticated axios instance, but specify responseType: 'blob'
        const response = await api.get(src, { responseType: 'blob' });
        const blob = response.data;
        if (active) {
          url = URL.createObjectURL(blob);
          setObjectUrl(url);
        }
      } catch (err) {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (src) {
      fetchImage();
    }

    return () => {
      active = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [src]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-secondary/50 text-muted-foreground text-xs text-center p-2 ${className || ''}`}>
        Failed to load image
      </div>
    );
  }

  if (loading || !objectUrl) {
    return (
      <div className={`flex items-center justify-center bg-secondary/50 ${className || ''}`}>
        <Loader2 className="w-5 h-5 text-primary animate-spin opacity-50" />
      </div>
    );
  }

  return (
    <Image 
      src={objectUrl} 
      alt={alt || "Image"} 
      className={className}
      unoptimized
      {...props} 
    />
  );
};
