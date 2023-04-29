import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { GetUser } from "auth/decorator";
import { JwtGuard } from "auth/guard";
import { User } from "@prisma/client";

@UseGuards(JwtGuard)
@Controller("users")
export class UserController {
  @Get("me")
  getMe(@GetUser() user: User) {
    return {
      message: "Success",
      payload: {
        user,
      },
    };
  }
}
