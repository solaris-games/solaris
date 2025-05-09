export class Route<PathParams extends Object, QueryParams extends Object, Req, Resp> {
    path: string;
    method: string;

    constructor(path: string, method: string) {
        this.path = path;
        this.method = method;
    }
}

export class GetRoute<PathParams extends Object, QueryParams extends Object, Resp> extends Route<PathParams, QueryParams, null, Resp> {
    constructor(path: string) {
        super(path, 'GET');
    }
}

export class SimpleGetRoute<Resp> extends GetRoute<{}, {}, Resp> {}

export class PatchRoute<PathParams extends Object, QueryParams extends Object, Req, Resp> extends Route<PathParams, QueryParams, Req, Resp> {
    constructor(path: string) {
        super(path, 'PATCH');
    }
}

export class SimplePatchRoute<Req, Resp> extends PatchRoute<{}, {}, Req, Resp> {}

export class PostRoute<PathParams extends Object, QueryParams extends Object, Req, Resp> extends Route<PathParams, QueryParams, Req, Resp> {
    constructor(path: string) {
        super(path, 'POST');
    }
}

export class SimplePostRoute<Req, Resp> extends PostRoute<{}, {}, Req, Resp> {}

export class DeleteRoute<PathParams extends Object, QueryParams extends Object, Resp> extends Route<PathParams, QueryParams, null, Resp> {
    constructor(path: string) {
        super(path, 'DELETE');
    }
}

export class SimpleDeleteRoute<Resp> extends DeleteRoute<{}, {}, Resp> {}

export class PutRoute<PathParams extends Object, QueryParams extends Object, Req, Resp> extends Route<PathParams, QueryParams, Req, Resp> {
    constructor(path: string) {
        super(path, 'PUT');
    }
}

export class SimplePutRoute<Req, Resp> extends PutRoute<{}, {}, Req, Resp> {}
