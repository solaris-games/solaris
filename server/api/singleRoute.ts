import { ParamsDictionary, RequestHandler, RequestHandlerParams, RouteParameters } from "express-serve-static-core";
import { ParsedQs } from "qs";

export function singleRoute<Route extends string,
                            P = RouteParameters<Route>,
                            ResBody = any,
                            ReqBody = any,
                            ReqQuery = ParsedQs,
                            LocalsObj extends Record<string, any> = Record<string, any>>
    (...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>): Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>;

export function singleRoute<Path extends string,
                            P = RouteParameters<Path>,
                            ResBody = any,
                            ReqBody = any,
                            ReqQuery = ParsedQs,
                            LocalsObj extends Record<string, any> = Record<string, any>>
    (...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>): Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>;

export function singleRoute<P = ParamsDictionary,
                            ResBody = any,
                            ReqBody = any,
                            ReqQuery = ParsedQs,
                            LocalsObj extends Record<string, any> = Record<string, any>>
    (...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>): Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>;

export function singleRoute<P = ParamsDictionary,
                            ResBody = any,
                            ReqBody = any,
                            ReqQuery = ParsedQs,
                            LocalsObj extends Record<string, any> = Record<string, any>>
    (...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>): Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>> {
    return [...handlers, (req, res, next) => { }];
}