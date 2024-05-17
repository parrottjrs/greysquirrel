import { AccessToken, RefreshToken } from "../utils/Token";
import { TEN_MINUTES, app } from "../utils/consts";
import { AuthRequest, authenticateToken } from "../utils/utils";

//INCLUDES:
//Endpoints that handle token requests.

app.get(
  "/api/authenticate",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === undefined) {
        return res
          .status(200)
          .json({ success: false, message: "Authorization error" });
      }
      return res.status(200).json({
        success: true,
        message: "Authorized",
        userId: req.userId,
      });
    } catch (err) {
      console.error("Authentication error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Authentication failed" });
    }
  }
);

app.post("/api/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const verified = RefreshToken.verify(refreshToken);
    if (!refreshToken || !verified) {
      return res
        .status(200)
        .json({ success: false, message: "Authorization error" });
    }
    const access = AccessToken.create(verified.userId);
    return res
      .cookie("accessToken", access, {
        maxAge: TEN_MINUTES,
        httpOnly: true,
      })
      .status(200)
      .json({ success: true, message: "Authorized" });
  } catch (err) {
    console.error("Refresh token error", err);
    return res
      .status(500)
      .json({ success: false, message: "Token refresh failed" });
  }
});
