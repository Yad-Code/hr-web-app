// @/app/lib/utils.ts

export function formatDate(
  dateInput: Date | string | null | undefined,
): string {
  if (!dateInput) return "N/A";

  const date = new Date(dateInput);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
 
export function getAvatarFallback(name: string, imageUrl?: string | null) {
  if (imageUrl) return imageUrl;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=64748b`;
}
