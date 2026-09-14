/**
 * Safe API response parsing utilities to prevent "Unexpected end of JSON input" errors.
 */

export interface SafeJsonResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}

export async function safeParseJson<T = any>(res: Response): Promise<SafeJsonResult<T>> {
  const status = res.status;
  const ok = res.ok;

  try {
    const text = await res.text();

    if (!text || !text.trim()) {
      return {
        ok,
        status,
        data: null,
        error: ok ? null : `Server responded with status ${status} (empty body).`,
      };
    }

    const trimmed = text.trim();

    // Check if server returned an HTML error page (e.g., from an SPA fallback or proxy 502/504)
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<head')) {
      return {
        ok: false,
        status,
        data: null,
        error: `Server returned an HTML page instead of JSON (Status ${status}). The API route may be unavailable.`,
      };
    }

    const parsed = JSON.parse(trimmed);
    return {
      ok: ok && parsed?.success !== false,
      status,
      data: parsed,
      error: parsed?.error || (ok ? null : `Server responded with status ${status}.`),
    };
  } catch (err: any) {
    return {
      ok: false,
      status,
      data: null,
      error: `Failed to parse response: ${err?.message || 'Invalid format'}.`,
    };
  }
}
