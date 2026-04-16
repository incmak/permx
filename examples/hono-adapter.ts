/**
 * Example: Hono adapter for PermX authorization.
 *
 * This file demonstrates how to use the framework-agnostic
 * `handleAuthorization` and `handleApiAuthorization` functions
 * with Hono (https://hono.dev). The same pattern applies to
 * Fastify, Koa, Next.js, or any other HTTP framework.
 *
 * This file is NOT shipped in the package — it exists as a reference.
 */
import type { Context, Next } from 'hono';
import {
  handleAuthorization,
  handleApiAuthorization,
  type AuthorizationRequest,
  type PermXInstance,
} from '@permx/core';

interface HonoPermXConfig {
  extractUserId: (c: Context) => string | null;
  extractTenantId?: (c: Context) => string | null;
  isServiceCall?: (c: Context) => boolean;
  isSuperAdmin?: (c: Context) => boolean;
}

function toAuthRequest(c: Context, config: HonoPermXConfig): AuthorizationRequest {
  return {
    userId: config.extractUserId(c),
    tenantId: config.extractTenantId?.(c),
    isServiceCall: config.isServiceCall?.(c) ?? false,
    isSuperAdmin: config.isSuperAdmin?.(c) ?? false,
  };
}

/** Per-route permission check middleware for Hono */
export function authorize(permx: PermXInstance, config: HonoPermXConfig, permissionKey: string) {
  return async (c: Context, next: Next) => {
    const outcome = await handleAuthorization(permx, toAuthRequest(c, config), permissionKey);
    if (outcome.action === 'allow') return next();
    if (outcome.action === 'deny') return c.json({ error: 'Forbidden' }, 403);
    return c.json({ error: 'Authorization service unavailable' }, 500);
  };
}

/** API-route authorization middleware for Hono */
export function authorizeApi(permx: PermXInstance, config: HonoPermXConfig, service: string) {
  return async (c: Context, next: Next) => {
    const outcome = await handleApiAuthorization(
      permx, toAuthRequest(c, config), service, c.req.method, c.req.path,
    );
    if (outcome.action === 'allow') return next();
    if (outcome.action === 'deny') return c.json({ error: 'Forbidden' }, 403);
    return c.json({ error: 'Authorization service unavailable' }, 500);
  };
}
