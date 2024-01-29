import express from 'express';
import asyncHandler from 'express-async-handler';
import { verifyToken } from '../middelwares/verifyToken';
import {
   FollowOrUnFollowHandler,
   getAllFollowingHandler,
   getAllFollowersHandler,
} from '../handler/realtionship.handler';

export const relationshipRouter = express.Router();

relationshipRouter.route('/:followerId').post(verifyToken, asyncHandler(FollowOrUnFollowHandler));

relationshipRouter.route('/following').get(verifyToken, asyncHandler(getAllFollowingHandler));

relationshipRouter.route('/followers').get(verifyToken, asyncHandler(getAllFollowersHandler));
