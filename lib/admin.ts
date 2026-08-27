export function isUserAdmin(userId?: string, username?: string): boolean {
  const ADMIN_GITHUB_IDS = (process.env.ADMIN_GITHUB_IDS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (ADMIN_GITHUB_IDS.length === 0) {
    return false;
  }
  const uId = String(userId || "").trim().toLowerCase();
  const uName = String(username || "").trim().toLowerCase();

  return (
    (uId !== "" && ADMIN_GITHUB_IDS.includes(uId)) ||
    (uName !== "" && ADMIN_GITHUB_IDS.includes(uName))
  );
}
