import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("No authorization header provided");
      res.status(401).json({ error: "No authorization header" });
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("Invalid authorization header format");
      res.status(401).json({ error: "Invalid authorization header format" });
      return;
    }

    const token = authHeader.split(" ")[1];
    console.log("Verifying token:", token.substring(0, 10) + "...");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      console.error("Token verification error:", error);
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    if (!user) {
      console.log("No user found for token");
      res.status(401).json({ error: "User not found" });
      return;
    }

    console.log("User authenticated:", { id: user.id, email: user.email });
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};
