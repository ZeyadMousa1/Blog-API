import express from 'express';
import asyncHandler from 'express-async-handler';
import {
   createUserHandler,
   deleteProfile,
   getAllUsersHandler,
   getUserProfileHandler,
   getUsersCountHandler,
   profilePhotoUploadHandler,
   searchUsers,
   updateUserProfileHandler,
} from './users.handler';
import {
   verifyTokeAndIsAdminRole,
   verifyTokenAndOnlyUsers,
   verifyTokenAndAuthorization,
} from '../../shared/middelwares/manageRoles';
import { photoUpload } from '../../shared/middelwares/multer';
import { verifyToken } from '../../shared/middelwares/verifyToken';

export const userRouter = express.Router();

userRouter
   .route('/profile')
   .get(verifyTokeAndIsAdminRole, asyncHandler(getAllUsersHandler))
   .post(verifyTokeAndIsAdminRole, asyncHandler(createUserHandler));

userRouter
   .route('/profile/profile-photo-upload')
   .post(verifyToken, photoUpload.single('image'), asyncHandler(profilePhotoUploadHandler));

userRouter.route('/count').get(verifyTokeAndIsAdminRole, asyncHandler(getUsersCountHandler));

userRouter.route('/profile/search').get(verifyToken, asyncHandler(searchUsers));
userRouter
   .route('/profile/:id')
   .get(verifyToken, asyncHandler(getUserProfileHandler))
   .put(verifyTokenAndOnlyUsers, asyncHandler(updateUserProfileHandler))
   .delete(verifyTokenAndAuthorization, asyncHandler(deleteProfile));
