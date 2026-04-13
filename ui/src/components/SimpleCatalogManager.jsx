import CrudPanel from './CrudPanel';

export default function SimpleCatalogManager({ title, subtitle, queryKey, endpoint, fields }) {
  return (
    <CrudPanel
      title={title}
      subtitle={subtitle}
      queryKey={queryKey}
      endpoint={endpoint}
      fields={fields}
      rowLabel={(item) => item.name}
    />
  );
}
