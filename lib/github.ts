/**
 * GitHub API helpers — fetching user repos and metadata.
 * Uses the authenticated user's GitHub token via next-auth.
 */

const GITHUB_API = "https://api.github.com";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  private: boolean;
  fork: boolean;
}

/**
 * Fetch all public repos for a user (paginated).
 * Requires a GitHub token with `repo` scope.
 */
export async function fetchUserRepos(
  accessToken: string,
  username?: string
): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;

  while (true) {
    let res = await fetch(
      `${GITHUB_API}/user/repos?sort=updated&per_page=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!res.ok && username && !username.includes(" ")) {
      res = await fetch(
        `${GITHUB_API}/users/${username}/repos?type=public&sort=updated&per_page=100&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );
    }

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const data: GitHubRepo[] = await res.json();
    repos.push(...data);

    if (data.length < 100) break;
    page++;
  }

  // Exclude forks and private repos
  return repos.filter((r) => !r.fork && !r.private);
}

/**
 * Fetch contributor count for a repo.
 */
export async function fetchContributorCount(
  accessToken: string,
  fullName: string
): Promise<number> {
  // Use per_page=1 and check the Link header for total count
  const res = await fetch(
    `${GITHUB_API}/repos/${fullName}/contributors?per_page=1&anon=false`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!res.ok) {
    // If the endpoint fails (e.g. rate limit), return 0
    return 0;
  }

  // Parse the last page from the Link header to get total count
  const linkHeader = res.headers.get("link");
  if (!linkHeader) {
    // If no Link header, the result itself tells us
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  }

  const lastMatch = linkHeader.match(/page=(\d+)>;\s*rel="last"/);
  if (lastMatch) {
    return parseInt(lastMatch[1], 10);
  }

  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
}

/**
 * Fetch commit count in the last N days for a repo.
 * Uses the commits endpoint with date filtering.
 */
export async function fetchRecentCommitCount(
  accessToken: string,
  fullName: string,
  days: number = 90
): Promise<number> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Fetch up to 1000 commits (10 pages of 100)
  let total = 0;
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(
      `${GITHUB_API}/repos/${fullName}/commits?since=${since}&per_page=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!res.ok) break;

    const data = await res.json();
    total += data.length;

    if (data.length < 100) break;
  }

  return total;
}

/**
 * Get the authenticated user's login from the GitHub API.
 */
export async function fetchCurrentUser(
  accessToken: string
): Promise<{ login: string; avatar_url: string; id: number }> {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  return res.json();
}
