import {GetRoute, PostRoute, PutRoute} from "solaris-common";
import type { Request, Response, NextFunction } from "express";
import {ok, Validator} from "../validate";

type ControllerHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const noPathParams: Validator<{}> = ok({});

export const handleGet = <PathParams extends Object, Resp>(route: GetRoute<PathParams, Resp>, handler: (pathArgs: PathParams) => Promise<Resp>, validatePath: Validator<PathParams>): ControllerHandler => {
    return async (req, res, next) => {
        try {
            const pathParams = validatePath(req.params);
            const result = await handler(pathParams);

            res.status(200).json(result);

            return next();
        } catch (err) {
            return next(err);
        }
    }
}

const handlePost = <PathParams extends Object, Req, Resp>(route: PostRoute<PathParams, Req, Resp>, handler: (pathArgs: PathParams, body: Req) => Promise<Resp>, validatePath: Validator<PathParams>, validateBody: Validator<Req>): ControllerHandler => {
    return async (req, res, next) => {
        try {
            const pathParams = validatePath(req.params);
            const body = validateBody(req.body);
            const result = await handler(pathParams, body);

            res.status(200).json(result);

            return next();
        } catch (err) {
            return next(err);
        }
    }
}