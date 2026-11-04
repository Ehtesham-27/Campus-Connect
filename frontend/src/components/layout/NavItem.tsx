import React from 'react';
import { NavLink } from 'react-router-dom';
import { Badge } from '../ui/Badge';

export interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badgeCount?: number | string;
  badgeVariant?: 'blue' | 'yellow' | 'orange' | 'pink' | 'purple' | 'black';
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  badgeCount,
  badgeVariant = 'pink',
  onClick,
}) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `cc-nav-item ${isActive ? 'cc-nav-item-active' : ''}`
      }
    >
      <div className="cc-nav-item-content">
        <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span>{label}</span>
      </div>
      {badgeCount !== undefined && (
        <Badge variant={badgeVariant} size="sm">
          {badgeCount}
        </Badge>
      )}
    </NavLink>
  );
};

