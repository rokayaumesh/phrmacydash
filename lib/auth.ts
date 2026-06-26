import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export function createToken() {
  return jwt.sign(
    {
      role: "admin",
    },
    SECRET,
    {
      expiresIn: "8h",
    }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}