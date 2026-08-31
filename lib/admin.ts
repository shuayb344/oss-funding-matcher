export function isUserAdmin(userId?: string, username?: string): boolean {
  const envVars = [
    process.env.ADMIN_GITHUB_IDS,
    process.env.NEXT_PUBLIC_ADMIN_GITHUB_IDS,
    process.env.NEXT_PUBLIC_ADMIN_GITHUB_ID,
  ];

  const ADMIN_GITHUB_IDS = envVars
    .filter(Boolean)
    .join(",")
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

