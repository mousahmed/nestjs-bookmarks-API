import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as pactum from "pactum";
import { AppModule } from "../src/app.module";
import { AuthDto } from "../src/auth/dto";
import { PrismaService } from "../src/prisma/prisma.service";
import { EditUserDto } from "../src/user/dto";

describe("App e2e", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl("http://localhost:3333");
  });

  afterAll(() => {
    app.close();
  });

  it.todo("Should Pass");

  describe("Auth", () => {
    const dto: AuthDto = {
      email: "user@website.com",
      password: "test@123",
    };

    describe("Sign up", () => {
      it("Should throw an error when email is empty", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it("Should throw an error when password is empty", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it("Should throw an error if no request body provided", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({})
          .expectStatus(400);
      });

      it("Should sign up", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe("Sign in", () => {
      it("Should throw an error when email is empty", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it("Should throw an error when password is empty", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it("Should throw an error if no request body provided", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({})
          .expectStatus(400);
      });

      it("Should sign in", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody(dto)
          .expectStatus(200)
          .stores("userAt", "payload.access_token");
      });
    });
  });

  describe("User", () => {
    describe("Get current User", () => {
      it("Should return user info", () => {
        return pactum
          .spec()
          .get("/users/me")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200);
      });
    });
    describe("Edit user", () => {
      const dto: EditUserDto = {
        firstName: "firstName",
        lastName: "lastName",
      };
      it("Should edit user email", () => {
        return pactum
          .spec()
          .patch("/users")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .withBody(dto)
          .expectStatus(200)
          .inspect();
      });
    });
  });

  describe("Bookmarks", () => {
    describe("Create bookmarks", () => {});
    describe("Get bookmarks", () => {});
    describe("Get bookmark By Id", () => {});
    describe("Edit bookmark", () => {});
    describe("Delete bookmark", () => {});
  });
});
