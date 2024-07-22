import { ParamsDictionary, RequestHandler, RequestHandlerParams, RouteParameters } from "express-serve-static-core";
import { ParsedQs } from "qs";
import {Router} from "express";

function singleRoute<Route extends string,
                            P = RouteParameters<Route>,
                            ResBody = any,
                            ReqBody = any,
                            ReqQuery = ParsedQs,
                            LocalsObj extends Record<string, any> = Record<string, any>>
    (...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>): Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>;

function singleRoute<Path extends string,
                            P = RouteParameters<Path>,
                            ResBody = any,
                            ReqBody = any,
                            ReqQuery = ParsedQs,
                            LocalsObj extends Record<string, any> = Record<string, any>>
    (...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>): Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>;

function singleRoute<P = ParamsDictionary,
                            ResBody = any,
                            ReqBody = any,
                            ReqQuery = ParsedQs,
                            LocalsObj extends Record<string, any> = Record<string, any>>
    (...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>): Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>;

function singleRoute<P = ParamsDictionary,
                            ResBody = any,
                            ReqBody = any,
                            ReqQuery = ParsedQs,
                            LocalsObj extends Record<string, any> = Record<string, any>>
    (...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>): Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>> {
    return [...handlers, (req, res, next) => { }];
}

export class SingleRouter {
    router: Router;

    constructor(router: Router) {
        this.router = router;
    }

    get(route: string, ...handlers: Array<RequestHandler>): void {
        this.router.get(route, ...singleRoute(...handlers));
    }

    post(route: string, ...handlers: Array<RequestHandler>): void {
        this.router.post(route, ...singleRoute(...handlers));
    }

    put(route: string, ...handlers: Array<RequestHandler>): void {
        this.router.put(route, ...singleRoute(...handlers));
    }

    delete(route: string, ...handlers: Array<RequestHandler>): void {
        this.router.delete(route, ...singleRoute(...handlers));
    }

    patch(route: string, ...handlers: Array<RequestHandler>): void {
        this.router.patch(route, ...singleRoute(...handlers));
    }
}