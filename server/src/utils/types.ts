import { RequestHandler } from 'express';

export type withError<T> = T & { error: string };

export type ExpressHandler<Params, Req, Res, Query> = RequestHandler<
   Partial<Params>,
   Partial<withError<Res>>,
   Partial<Req>,
   Partial<Query>
>;

export interface PayLoad {
   id: string;
   isAdmin: boolean;
}
