
export function formatDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "N/A";

  const date = new Date(dateInput);

  // Use UTC to prevent local timezone offsets from shifting dates back by 1 day
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}