import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'yellow' | 'orange' | 'pink' | 'purple' | 'cream' | 'black' | 'white';
  size?: 'sm' | 'md' | 'lg';
  sticker?: boolean;
  rotate?: 'left' | 'right' | 'none';
  withShadow?: boolean;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'blue',
  size = 'md',
  sticker = false,
  rotate = 'none',
  withShadow = true,
  children,
  className = '',
  ...props
}) => {
  const variantClass = `cc-badge-${variant}`;
  const sizeClass = `cc-badge-${size}`;
  const shadowClass = withShadow ? 'cc-badge-shadow' : '';

  let stickerClass = '';
  if (sticker) {
    if (rotate === 'right') {
      stickerClass = 'cc-sticker cc-sticker-rotate-right';
    } else {
      stickerClass = 'cc-sticker';
    }
  }

  return (
    <span
      className={`cc-badge ${variantClass} ${sizeClass} ${shadowClass} ${stickerClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

