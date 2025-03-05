import { Request as ExpressRequest } from "express"
import { DecodedIdToken } from "firebase-admin/auth"
interface Request extends ExpressRequest {
  user?: DecodedIdToken
}

export type { Request }
