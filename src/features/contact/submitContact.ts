import { SITE } from '../../data/site';
import type { ContactData } from './contactSchema';

/**
 * Integration boundary for the contact form.
 *
 * Contract: POST `VITE_CONTACT_ENDPOINT` with JSON `ContactData`; any 2xx = accepted.
 * Works with a serverless function, Formspree-style service or your own API.
 * The endpoint must validate again, rate-limit and handle CORS — keep any API
 * keys on the server side, never in VITE_* variables.
 */
export type SubmitResult = { kind: 'sent' } | { kind: 'not-configured' };

export class SubmitError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'SubmitError';
  }
}

const TIMEOUT_MS = 15_000;

export async function submitContact(data: ContactData): Promise<SubmitResult> {
  const endpoint = SITE.contactEndpoint;
  if (!endpoint) return { kind: 'not-configured' };

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
      credentials: 'omit',
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new SubmitError(
        response.status === 429
          ? 'Too many attempts. Please wait a minute and try again.'
          : 'The server could not accept your message. Please try again.',
        response.status,
      );
    }
    return { kind: 'sent' };
  } catch (error) {
    if (error instanceof SubmitError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new SubmitError('The request timed out. Check your connection and try again.');
    }
    throw new SubmitError('Network error — your message was not sent. Please try again.');
  } finally {
    window.clearTimeout(timer);
  }
}

export function buildMailto(data: ContactData): string | undefined {
  if (!SITE.contactEmail) return undefined;
  const subject = `Project enquiry — ${data.projectType}`;
  const body = `${data.message}\n\n— ${data.name} (${data.email})`;
  return `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
