import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as pactum from "pactum";
import { AppModule } from "../src/app.module";
import { AuthDto } from "../src/auth/dto";
import { PrismaService } from "../src/prisma/prisma.service";
import { EditUserDto } from "../src/user/dto";
import { CreateBookmarkDto, EditBookmarkDto } from "../src/bookmark/dto";
import { inspect } from "util";

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
      it("Should throw an error when email is empty", async () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it("Should throw an error when password is empty", async () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it("Should throw an error if no request body provided", async () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({})
          .expectStatus(400);
      });

      it("Should sign up", async () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe("Sign in", () => {
      it("Should throw an error when email is empty", async () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it("Should throw an error when password is empty", async () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it("Should throw an error if no request body provided", async () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({})
          .expectStatus(400);
      });

      it("Should sign in", async () => {
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
      it("Should return user info", async () => {
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
      it("Should edit user email", async () => {
        return pactum
          .spec()
          .patch("/users")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });

  describe("Bookmarks", () => {
    describe("Create bookmarks", () => {
      const dto: CreateBookmarkDto = {
        title: "test title",
        description: "optional description",
        link: "http://example.com",
      };

      it("Should create a bookmark", async () => {
        return pactum
          .spec()
          .post("/bookmarks")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .withBody(dto)
          .expectStatus(201)
          .stores("bookmarkId", "payload.bookmark.id");
      });
    });

    describe("Get bookmarks", () => {
      it("Should return bookmarks", async () => {
        return pactum
          .spec()
          .get("/bookmarks")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200);
      });
    });

    describe("Get bookmark By Id", () => {
      it("Should get a bookmark by id", async () => {
        return pactum
          .spec()
          .get("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200);
      });
    });

    describe("Edit bookmark", () => {
      const dto: EditBookmarkDto = {
        description: "Changed description",
      };

      it("Should edit a bookmark", async () => {
        return pactum
          .spec()
          .patch("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.description);
      });
    });

    describe("Delete bookmark", () => {
      it("Should delete a bookmark", async () => {
        return pactum
          .spec()
          .delete("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(204);
      });
    });
  });
});
