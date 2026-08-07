import { env } from '../config/env.js';
import logger from '../config/logger.js';
import ApiError from '../utils/ApiError.js';

/**
 * Checks whether the remote ML screening service (see /ml-service) is up
 * and reports which models it has loaded. Never throws — an unreachable
 * or misconfigured service degrades to a clear "unavailable" status rather
 * than breaking the dashboard banner that displays this.
 */
export const checkServiceStatus = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${env.mlService.url}/health`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return { reachable: false, detail: `Service responded with HTTP ${res.status}` };
    }

    const data = await res.json();
    return {
      reachable: data.status === 'ok',
      detail: data.status === 'ok' ? null : data.loadError || 'Models failed to load',
      vehicleClasses: data.vehicleClasses,
      helmetClasses: data.helmetClasses,
      plateClasses: data.plateClasses,
    };
  } catch (err) {
    return { reachable: false, detail: err.name === 'AbortError' ? 'Service timed out' : err.message };
  }
};

/**
 * Shared forwarding logic for both /screen (image) and /screen-video —
 * same error handling, different endpoint and timeout budget.
 */
const _forwardToMlService = async (endpoint, fileBuffer, originalName, mimetype, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    const form = new FormData();
    form.append('file', new Blob([fileBuffer], { type: mimetype }), originalName || 'upload');

    res = await fetch(`${env.mlService.url}${endpoint}`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw ApiError.badRequest('The detection service took too long to respond. Please try again.');
    }
    logger.error(`ML service unreachable: ${err.message}`);
    throw new ApiError(
      503,
      'The AI detection service is currently unavailable. You can still issue the violation manually.'
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status === 400 ? 400 : 502,
      body.detail || 'The detection service could not process this file'
    );
  }

  return res.json();
};

/**
 * Forwards an uploaded image buffer to the remote service's staged
 * screening pipeline:
 *   Stage 1 — is this even a two-wheeler? (vehicle-type model)
 *   Stage 2 — is the rider missing a helmet? (only runs if Stage 1 passes)
 *   Stage 3 — where's the plate? (only runs if Stage 2 finds a violation)
 * Returns the full structured result — never issues or auto-creates
 * anything itself.
 */
export const screenImage = (fileBuffer, originalName, mimetype) =>
  _forwardToMlService('/screen', fileBuffer, originalName, mimetype, env.mlService.timeoutMs);

/**
 * Forwards an uploaded video to the remote service, which samples frames
 * across its full duration and runs each through the same staged pipeline.
 * Returns only the frames that produced a violation, each with its own
 * timestamp and captured image. Can genuinely take a minute or more for
 * even a short clip on CPU — uses the much longer videoTimeoutMs budget.
 */
export const screenVideo = (fileBuffer, originalName, mimetype) =>
  _forwardToMlService('/screen-video', fileBuffer, originalName, mimetype, env.mlService.videoTimeoutMs);
