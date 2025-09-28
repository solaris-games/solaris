import {SingleRouter} from "../singleRoute";
import {MiddlewareContainer} from "../middleware";
import {RequestHandler} from "express-serve-static-core";
import {Route} from "solaris-common";

export const createRoutes = (router: SingleRouter, mw: MiddlewareContainer) => <PathParams extends Object, QueryParams extends Object, Req, Resp>(route: Route<PathParams, QueryParams, Req, Resp>, ...handlers: Array<RequestHandler>) => {
    switch (route.method) {
        case 'GET':
            router.get(route.path, ...handlers);
            break;
        case 'POST':
            router.post(route.path, ...handlers);
            break;
        case 'PATCH':
            router.patch(route.path, ...handlers);
            break;
        case 'DELETE':
            router.delete(route.path, ...handlers);
            break;
        case 'PUT':
            router.put(route.path, ...handlers);
            break;
        default:
            throw new Error(`Unsupported HTTP method: ${route.method}`);
    }
}