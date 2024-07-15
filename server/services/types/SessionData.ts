import 'express-session'
import { DBObjectId } from './DBObjectId'

declare module 'express-session' {
    interface SessionData {
        userId: DBObjectId
    }
}