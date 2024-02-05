import express from 'express';
import asyncHandler from 'express-async-handler';
import { verifyToken } from '../../shared/middelwares/verifyToken';
import {
   FollowOrUnFollowHandler,
   getAllFollowingHandler,
   getAllFollowersHandler,
} from './realtionship.handler';

export const relationshipRouter = express.Router();

relationshipRouter.route('/:userId').post(verifyToken, asyncHandler(FollowOrUnFollowHandler));

relationshipRouter.route('/following').get(verifyToken, asyncHandler(getAllFollowingHandler));

relationshipRouter.route('/followers').get(verifyToken, asyncHandler(getAllFollowersHandler));
