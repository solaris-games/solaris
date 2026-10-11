import "express-session";
import { UserSession } from "../../api/sessions/session";

declare module "express-session" {
    interface SessionData extends UserSession {}
}
