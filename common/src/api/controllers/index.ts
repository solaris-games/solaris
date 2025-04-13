export class Route<PathParams extends Object, Req, Resp> {
    path: string;
    method: string;

    constructor(path: string, method: string) {
        this.path = path;
        this.method = method;
    }
}

export class GetRoute<PathParams extends Object, Resp> extends Route<PathParams, null, Resp> {
    constructor(path: string) {
        super(path, 'GET');
    }
}

export class PatchRoute<PathParams extends Object, Req, Resp> extends Route<PathParams, Req, Resp> {
    constructor(path: string) {
        super(path, 'PATCH');
    }
}

export class PostRoute<PathParams extends Object, Req, Resp> extends Route<PathParams, Req, Resp> {
    constructor(path: string) {
        super(path, 'POST');
    }
}

export class DeleteRoute<PathParams extends Object, Resp> extends Route<PathParams, null, Resp> {
    constructor(path: string) {
        super(path, 'DELETE');
    }
}

export class PutRoute<PathParams extends Object, Req, Resp> extends Route<PathParams, Req, Resp> {
    constructor(path: string) {
        super(path, 'PUT');
    }
}
