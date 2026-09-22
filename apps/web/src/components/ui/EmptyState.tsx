interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-white p-10 text-center">
      <h3 className="text-lg font-medium text-zinc-900">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
