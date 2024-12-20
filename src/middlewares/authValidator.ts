import { NextFunction, Request, Response } from "express";
import { verifyIdToken } from "../firebase/setup";

interface AuthenticatedRequest extends Request {
  user?: string;
}

// @ts-ignore
export async function authValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader: string = req.headers.authorization || "";
    const userIdToken: string = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : "";

    if (!userIdToken) {
      return res
        .status(401)
        .json({ message: "Authorization token is required" });
    }

    const userUID: string | null = await verifyIdToken(userIdToken);
    if (!userUID) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as AuthenticatedRequest).user = userUID; // Attach user UID to request
    next(); // Proceed to the next middleware or route handler
  } catch (err:any) {
    console.error(`[ERROR] authValidator: ${err.message || err}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
