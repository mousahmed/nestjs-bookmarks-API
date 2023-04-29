import { ForbiddenException, Injectable } from "@nestjs/common";
import { CreateBookmarkDto, EditBookmarkDto } from "./dto";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: number) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
    });
    return { message: "Success", payload: { bookmarks } };
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });

    return { message: "Success", payload: { bookmark } };
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    return { message: "Success", payload: { bookmark } };
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException("Access to resources denied");
    }
    const modifiedBookmark = await this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
    return { message: "Success", payload: { bookmark: modifiedBookmark } };
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException("Access to resources denied");
    }
    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
    return { message: "Success" };
  }
}
