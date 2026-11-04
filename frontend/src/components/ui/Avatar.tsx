import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'rounded' | 'circle';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User avatar',
  initials = 'CC',
  size = 'md',
  shape = 'rounded',
  className = '',
  ...props
}) => {
  const sizeClass = `cc-avatar-${size}`;
  const shapeClass = shape === 'circle' ? 'cc-avatar-circle' : '';

  return (
    <div className={`cc-avatar ${sizeClass} ${shapeClass} ${className}`} {...props}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <span>{initials.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
};
