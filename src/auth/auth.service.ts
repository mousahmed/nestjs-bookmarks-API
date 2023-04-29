import { ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { Prisma } from "@prisma/client";
import { ConfigService } from "@nestjs/config";

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    // generate the password hash
    const hash = await argon.hash(dto.password);
    // save the new user in db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      delete user.hash;

      // return the saved user
      return { message: "Successful Sign Up", data: user };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Credentials are taken ");
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if user does not exist throw error
    if (!user) throw new ForbiddenException("Credentials incorrect");
    // compare passwords' hashes
    const pwMatches = await argon.verify(user.hash, dto.password);
    // if password is incorrect throw an exception
    if (!pwMatches) throw new ForbiddenException("Credentials incorrect");
    // return user
    delete user.hash;
    const accessToken = await this.signToken(user.id, user.email);
    const payload = { access_token: accessToken };
    return { message: "Successful Sign In", payload };
  }

  async signToken(userId: number, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get("JWT_SECRET");
    return this.jwt.signAsync(payload, {
      expiresIn: "15m",
      secret,
    });
  }
}
