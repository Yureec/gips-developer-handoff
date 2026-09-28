import { Segment, SegmentedControl } from '@alfalab/core-components/segmented-control';

import type { DashboardData } from '../data/provider';
import { roles, sectionsByRole, type RoleId, type SectionId } from '../domain/navigation';
import { AlfaSelect } from './AlfaSelect';
import { GlobalSearch } from './GlobalSearch';

interface AppHeaderProps {
  activeSection: SectionId;
  employee: DashboardData['employee'];
  role: RoleId;
  search: string;
  onRoleChange: (role: RoleId) => void;
  onSearchChange: (value: string) => void;
  onSectionChange: (section: SectionId) => void;
}

export function AppHeader({
  activeSection,
  employee,
  role,
  search,
  onRoleChange,
  onSearchChange,
  onSectionChange,
}: AppHeaderProps) {
  const navigationSections = sectionsByRole[role];
  const navigationSection =
    ['knowledge', 'investor'].includes(activeSection) && navigationSections.some(s => s.id === 'learning') ? 'learning' : activeSection === 'products'
      ? 'focus'
      : navigationSections.some((section) => section.id === activeSection)
        ? activeSection
        : 'home';

  return (
    <header className="app-header">
      <div className="header-identity-row">
        <section className="header-user" aria-label="Текущий сотрудник">
          <img className="header-user__avatar" src={employee.image} alt="" />
          <div className="header-user__content">
            <div className="header-user__name-row">
              <strong>{employee.name}</strong>
              <span>{employee.league}</span>
            </div>
            <p>{employee.role} · {employee.office}</p>
          </div>
        </section>

        <GlobalSearch
          value={search}
          onChange={onSearchChange}
          onNavigate={onSectionChange}
        />

        <div className="mode-switcher">
          <AlfaSelect
            accessibleName="Роль сотрудника"
            block
            className="role-select-control"
            fieldClassName="role-select-control__field"
            options={roles.map((item) => ({ key: item.id, content: item.shortLabel }))}
            optionsListWidth="field"
            selected={role}
            size={40}
            onChange={({ selected }) => selected && onRoleChange(selected.key as RoleId)}
          />
        </div>
      </div>

      {navigationSections.length > 1 ? (
        <nav className="primary-navigation" aria-label="Основные разделы">
          <SegmentedControl
            className="primary-navigation__control"
            selectedId={navigationSection}
            size={32}
            shape="rounded"
            onChange={(selectedId) => onSectionChange(selectedId as SectionId)}
          >
            {navigationSections.map((section) => (
              <Segment id={section.id} key={section.id} title={section.label} />
            ))}
          </SegmentedControl>
        </nav>
      ) : null}
    </header>
  );
}
