export class Route<PathParams extends Object, Req, Resp> {
    path: string;

    constructor(path: string) {
        this.path = path;
    }
}

export class GetRoute<PathParams extends Object, Resp> extends Route<PathParams, null, Resp> {};

export class PatchRoute<PathParams extends Object, Req, Resp> extends Route<PathParams, Req, Resp> {};

export class PostRoute<PathParams extends Object, Req, Resp> extends Route<PathParams, Req, Resp> {};

export class DeleteRoute<PathParams extends Object, Req, Resp> extends Route<PathParams, Req, Resp> {};