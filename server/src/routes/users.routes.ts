import express from 'express';
import asyncHandler from 'express-async-handler';
import {
   deleteProfile,
   getAllUsersHandler,
   getUserHandler,
   getUsersCountHandler,
   profilePhotoUploadHandler,
   updateUserProfileHandler,
} from '../handler/users.handler';
import {
   verifyTokeAndIsAdminRole,
   verifyTokenAndOnlyUsers,
   verifyTokenAndAuthorization,
} from '../middelwares/manageRoles';
import { photoUpload } from '../middelwares/photoUpload';
import { verifyToken } from '../middelwares/verifyToken';

export const userRouter = express.Router();

userRouter.route('/profile').get(verifyTokeAndIsAdminRole, asyncHandler(getAllUsersHandler));

userRouter
   .route('/profile/profile-photo-upload')
   .post(verifyToken, photoUpload.single('image'), asyncHandler(profilePhotoUploadHandler));

userRouter.route('/count').get(verifyTokeAndIsAdminRole, asyncHandler(getUsersCountHandler));

userRouter
   .route('/profile/:id')
   .get(verifyToken, asyncHandler(getUserHandler))
   .put(verifyTokenAndOnlyUsers, asyncHandler(updateUserProfileHandler))
   .delete(verifyTokenAndAuthorization, asyncHandler(deleteProfile));
