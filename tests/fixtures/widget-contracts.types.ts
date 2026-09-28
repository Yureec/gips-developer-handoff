import type { RoleSectionProps, DataTableProps } from '../../src/components/RolePrimitives';
import type { HeadingVariant, MetadataVariant, MetricValueVariant } from '../../src/components/Typography';

const dashboard: RoleSectionProps = { variant: 'dashboard', title: 'Summary', children: null };
const content: RoleSectionProps = { variant: 'content', title: 'Table', children: null };
// @ts-expect-error Geometry must be an explicit choice.
const implicit: RoleSectionProps = { title: 'Summary', children: null };
// @ts-expect-error Role-specific size variants are not supported.
const roleVariant: RoleSectionProps = { ...dashboard, variant: 'manager' };
// @ts-expect-error Arbitrary classes must not override shell geometry.
const customShell: RoleSectionProps = { ...content, className: 'custom-height' };
const table: DataTableProps = { label: 'Products', headings: [], children: null, variant: 'focus-products' };
// @ts-expect-error Table layout is selected by typed variant.
const customTable: DataTableProps = { ...table, className: 'custom-table' };
// @ts-expect-error Unsupported table variants must fail at compile time.
const unknownTable: DataTableProps = { ...table, variant: 'dense' };
const heading: HeadingVariant = 'section';
const metric: MetricValueVariant = 'compact';
const metadata: MetadataVariant = 'detail';
// @ts-expect-error Heading roles are finite and semantic.
const headingByPixels: HeadingVariant = '32px';
// @ts-expect-error Metric variants describe use, not viewport-specific sizes.
const roleMetric: MetricValueVariant = 'manager';
// @ts-expect-error Metadata does not accept arbitrary density names.
const denseMetadata: MetadataVariant = 'tiny';
void [dashboard, content, implicit, roleVariant, customShell, table, customTable, unknownTable, heading, metric, metadata, headingByPixels, roleMetric, denseMetadata];
