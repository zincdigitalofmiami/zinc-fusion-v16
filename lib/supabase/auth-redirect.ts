const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);
const DEFAULT_PROD_SITE_URL = "https://zinc-fusion-v16.vercel.app";

function normalizeBaseUrl(url: string): string {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      "Invalid NEXT_PUBLIC_SITE_URL. Use a full URL like https://zinc-fusion-v16.vercel.app",
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      "Invalid NEXT_PUBLIC_SITE_URL protocol. Use http:// or https://",
    );
  }

  return parsed.origin;
}

export function getAuthBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return normalizeBaseUrl(configuredUrl);
  }

  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;

    if (
      LOCAL_HOSTNAMES.has(hostname) ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".localhost")
    ) {
      return origin;
    }
  }

  return normalizeBaseUrl(DEFAULT_PROD_SITE_URL);
}

export function buildAuthRedirectUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`Auth redirect path must start with '/': received '${path}'`);
  }

  return `${getAuthBaseUrl()}${path}`;
}
