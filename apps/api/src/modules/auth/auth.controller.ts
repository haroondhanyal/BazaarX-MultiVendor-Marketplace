import { Body, Controller, Post } from "@nestjs/common";

interface Credentials {
  name?: string;
  email: string;
  password: string;
}

@Controller("auth")
export class AuthController {
  @Post("login")
  login(@Body() body: Credentials) {
    // Demo only: this response is a mock session, not a production authentication token.
    const displayName = body.name?.trim() || body.email.split("@")[0];
    return {
      user: {
        id: body.email.toLowerCase(),
        name: displayName,
        email: body.email,
        role: "customer",
      },
      accessToken: "mock-session",
    };
  }

  @Post("register")
  register(@Body() body: Credentials) {
    const displayName = body.name?.trim() || body.email.split("@")[0];
    return {
      user: {
        id: body.email.toLowerCase(),
        name: displayName,
        email: body.email,
        role: "customer",
      },
      accessToken: "mock-session",
    };
  }
}
