import { ExpressHandler } from '../utils/types';
import { verifyToken } from './verifyToken';

// verify token [only admin can perform this action]
export const verifyTokeAndIsAdminRole: ExpressHandler<{}, {}, {}, {}> = (req, res, next) => {
   verifyToken(req, res, () => {
      if (!(req as any).currentUser.isAdmin) {
         return res.status(403).json({ error: 'not allowed, only admin' });
      }
      next();
   });
};

// verify token [Only the user himself can perform this action]
export const verifyTokenAndOnlyUsers: ExpressHandler<{ id: string }, {}, {}, {}> = (
   req,
   res,
   next
) => {
   verifyToken(req, res, () => {
      if ((req as any).currentUser.id === req.params.id) {
         next();
      } else {
         return res.status(403).json({ error: 'not allowed, only users himSelf' });
      }
   });
};

// verify token [Only user him self or admin can perform this action]
export const verifyTokenAndAuthorization: ExpressHandler<{ id: string }, {}, {}, {}> = (
   req,
   res,
   next
) => {
   verifyToken(req, res, () => {
      if ((req as any).currentUser.id === req.params.id || (req as any).currentUser.isAdmin) {
         next();
      } else {
         return res.status(403).json({ error: 'not allowed, only users himSelf or admin' });
      }
   });
};
