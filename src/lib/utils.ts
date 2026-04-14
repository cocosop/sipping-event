export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
  const random = Math.random().toString(36).slice(2, 7);
  return `${base}-${random}`;
}

export function getOrCreateGuestId(): string {
  const key = 'sipping_guest_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export function getDaysRemaining(expiresAt: string): number {
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((expires - now) / (1000 * 60 * 60 * 24)));
}

export function getEventUrl(slug: string): string {
  return `${window.location.origin}${window.location.pathname}?event=${slug}`;
}
