export function workforceApiUrl(path) {
  const baseUrl = (
    process.env.NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL ?? ''
  ).replace(/\/+$/, '');
  return `${baseUrl}${path}`;
}
