import type { CSSProperties } from 'react';

import employeeAvatarS1 from '../assets/employee-avatar-s1.webp';
import employeeAvatarS2 from '../assets/employee-avatar-s2.webp';

const avatarPositions: Record<string, { image: string; x: number; y: number }> = {
  anna: { image: employeeAvatarS1, x: 0, y: 0 },
  kirill: { image: employeeAvatarS1, x: 50, y: 0 },
  nina: { image: employeeAvatarS1, x: 100, y: 0 },
  pavel: { image: employeeAvatarS1, x: 0, y: 50 },
  dmitry: { image: employeeAvatarS1, x: 50, y: 50 },
  olga: { image: employeeAvatarS1, x: 100, y: 50 },
  igor: { image: employeeAvatarS1, x: 0, y: 100 },
  marina: { image: employeeAvatarS1, x: 50, y: 100 },
  sergey: { image: employeeAvatarS1, x: 100, y: 100 },
  elena: { image: employeeAvatarS2, x: 0, y: 0 },
  roman: { image: employeeAvatarS2, x: 50, y: 0 },
  tatiana: { image: employeeAvatarS2, x: 100, y: 0 },
  alexey: { image: employeeAvatarS2, x: 0, y: 50 },
  svetlana: { image: employeeAvatarS2, x: 50, y: 50 },
  mikhail: { image: employeeAvatarS2, x: 100, y: 50 },
  daria: { image: employeeAvatarS2, x: 0, y: 100 },
  nikolay: { image: employeeAvatarS2, x: 50, y: 100 },
  irina: { image: employeeAvatarS2, x: 100, y: 100 },
};

export function EmployeeAvatar({ id, initials, color, className = '' }: {
  id: string;
  initials: string;
  color: string;
  className?: string;
}) {
  const avatar = avatarPositions[id];
  const style = avatar ? {
    backgroundColor: '#f4efea',
    backgroundImage: `url(${avatar.image})`,
    backgroundPosition: `${avatar.x}% ${avatar.y}%`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '300% 300%',
  } : { backgroundColor: color };

  return (
    <span
      aria-hidden="true"
      className={`employee-avatar ${avatar ? 'employee-avatar--photo' : ''} ${className}`.trim()}
      style={style as CSSProperties}
    >
      {avatar ? null : initials}
    </span>
  );
}
