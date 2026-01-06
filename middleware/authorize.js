import { AppError, ERROR_CODES } from '../config/constants.js';

/**
 * Authorize owner-or-admin for a resource.
 * loader(req) must resolve to the resource object containing a numeric userID (creator/owner).
 *
 * Usage:
 *   router.put('/:routeID', authRequired(), authorizeOwner(() => routes.get(req.params.routeID)), ...)
 *
 * @param {(req: import('express').Request) => Promise<any>} loader
 * @returns {import('express').RequestHandler}
 */
export function authorizeOwner(loader) {
  return async (req, _, next) => {
    try {
      // Authentication should have attached req.user in authRequired()
      const actor = req.user;
      if (!actor) {
        throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const resource = await loader(req);
      if (!resource) {
        throw new AppError('Resource not found', 404, ERROR_CODES.NOT_FOUND);
      }

      const ownerId = Number(resource.UserID);
      const actorId = Number(actor.UserID);

      const isOwner = Number.isFinite(ownerId) && ownerId === actorId;
      const isAdmin = Boolean(actor.IsAdmin);

      if (!isOwner && !isAdmin) {
        throw new AppError('Forbidden: not the owner', 403, ERROR_CODES.FORBIDDEN, { ownerId, actorId });
      }

      if (!isOwner && isAdmin) {
        req.IDtoSet = ownerId;
      }

      // Attach for downstream handlers if needed
      req.resource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Authorize member-or-owner-or-admin for a resource.
 * loader(req) must resolve to the resource object containing a numeric userID (creator/owner) and a Members array of userIDs.
 * Usage:
 *   router.put('/:conversationID', authRequired(), authorizeMember(() => convService.get(req.params.conversationID)), ...)
 * @param {(req: import('express').Request) => Promise<any>} loader
 * @returns {import('express').RequestHandler}
 */
export function authorizeMember(loader) {
  return async (req, _, next) => {
    try {
      // Authentication should have attached req.user in authRequired()
      const actor = req.user;
      if (!actor) {
        throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const resource = await loader(req);
      if (!resource) {
        throw new AppError('Resource not found', 404, ERROR_CODES.NOT_FOUND);
      }

      const ownerId = Number(resource.UserID);
      const actorId = Number(actor.UserID);
      const members = resource.Members || [];

      const isOwner = Number.isFinite(ownerId) && ownerId === actorId;
      const isMember = members.includes(actorId);
      const isAdmin = Boolean(actor.IsAdmin);

      if (!isOwner && !isMember && !isAdmin) {
        throw new AppError('Forbidden: not a member', 403, ERROR_CODES.FORBIDDEN, { ownerId, actorId });
      }

      if (isAdmin){
        req.adminOrigin = true;
      }

      // Attach for downstream handlers if needed
      req.resource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Authorize admin only.
 * Usage:
 *   router.delete('/:userID', authRequired(), authorizeAdmin(), ...)
 * * @returns {import('express').RequestHandler}
 */
export function authorizeAdmin() {
  return async (req, _, next) => {
    try {
      // Authentication should have attached req.user in authRequired()
      const actor = req.user;
      if (!actor) {
        throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const isAdmin = Boolean(actor.IsAdmin);

      if (!isAdmin) {
        throw new AppError('Forbidden: admin only', 403, ERROR_CODES.FORBIDDEN);
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
}

