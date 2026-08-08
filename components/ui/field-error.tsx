export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-danger text-xs" role="alert">
      {message}
    </p>
  );
}
