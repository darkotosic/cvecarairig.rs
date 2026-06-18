export const clearAdminSession = async () => {
  if (typeof window !== 'undefined') await fetch('/api/admin/logout', { method: 'POST' });
};
