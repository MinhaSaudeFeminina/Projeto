export function EditorialStatusBadge({ status }: { status: string }) {
  return <span aria-label={`Estado editorial ${status}`}>{status}</span>;
}
