import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { ExpressHandler } from '../utils/types';

const prisma = new PrismaClient();

/**
 * @desc    Create New Post
 * @route   /api/posts
 * @method  POST
 * @access private (only loggedin users himself)
 */
const createPostHandler: ExpressHandler<{}, {}, {}, {}> = async (req, res, next) => {};
