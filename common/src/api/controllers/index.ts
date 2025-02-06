export class Route<Req, Resp> {
    path: string;

    constructor(path: string) {
        this.path = path;
    }
}

export class GetRoute<Resp> extends Route<null, Resp> {};

export class PatchRoute<Req, Resp> extends Route<Req, Resp> {};

export class PostRoute<Req, Resp> extends Route<Req, Resp> {};