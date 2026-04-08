import {SingleRouter} from "../singleRoute";
import {MiddlewareContainer} from "../middleware";
import {DependencyContainer} from "../../services/types/DependencyContainer";
import {FrontendConfig} from "solaris-common";
import config from "../../config";

export default (router: SingleRouter, mw: MiddlewareContainer, container: DependencyContainer) => {
    router.get("/api/config", async (req, res) => {
        const frontendConfig: FrontendConfig = {
            ...config.frontend,
        };

        res.status(200).json(frontendConfig);
    });
};
