import { roles, sectionDefinitions, type RoleId, type SectionId } from '../domain/navigation';
import { Heading, Metadata } from '../components/Typography';

interface SectionPlaceholderProps {
  role: RoleId;
  section: SectionId;
}

export function SectionPlaceholder({ role, section }: SectionPlaceholderProps) {
  const roleDefinition = roles.find((item) => item.id === role);
  const sectionDefinition = sectionDefinitions.find((item) => item.id === section);

  return (
    <section className="section-placeholder" aria-labelledby="section-placeholder-title">
      <Metadata variant="eyebrow">Перенос из версии 20260910-7</Metadata>
      <Heading level={1} variant="page" id="section-placeholder-title">{sectionDefinition?.label}</Heading>
      <p>
        {roleDefinition?.label}: исходный экран учтён в матрице миграции. Его содержимое будет перенесено
        дословно и оформлено в текущей компонентной стилистике.
      </p>
    </section>
  );
}
