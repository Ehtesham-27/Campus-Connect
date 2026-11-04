import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: 'white' | 'cream' | 'blue' | 'yellow' | 'pink' | 'purple' | 'orange';
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  surface = 'white',
  interactive = false,
  children,
  className = '',
  ...props
}) => {
  const surfaceClass = `cc-card-${surface}`;
  const interactiveClass = interactive ? 'cc-card-interactive' : '';

  return (
    <div
      className={`cc-card ${surfaceClass} ${interactiveClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

