import {
  BadRequestException,
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Post,
  Req,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { randomUUID } from "node:crypto";
import { createReadStream, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const uploadFolder = resolve(process.cwd(), "uploads");
const allowedTypes: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

@Controller("uploads")
export class UploadsController {
  @Get(":filename")
  @Header("Cache-Control", "public, max-age=31536000, immutable")
  image(@Param("filename") filename: string) {
    if (!/^[0-9a-f-]+\.(jpg|png|webp)$/i.test(filename)) {
      throw new NotFoundException("Image not found.");
    }
    const path = resolve(uploadFolder, filename);
    if (!existsSync(path)) throw new NotFoundException("Image not found.");
    const mediaType = Object.entries(allowedTypes).find(([, extension]) =>
      filename.endsWith(extension),
    )?.[0];
    return new StreamableFile(createReadStream(path), {
      type: mediaType ?? "application/octet-stream",
    });
  }

  @Post("image")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          mkdirSync(uploadFolder, { recursive: true });
          callback(null, uploadFolder);
        },
        filename: (_request, file, callback) => {
          callback(null, `${randomUUID()}${allowedTypes[file.mimetype] ?? ".bin"}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
      fileFilter: (_request, file, callback) => {
        if (!allowedTypes[file.mimetype]) {
          callback(new BadRequestException("Upload a JPG, PNG, or WebP image."), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  upload(
    @UploadedFile() file: { filename: string; mimetype: string; size: number } | undefined,
    @Req() request: { protocol: string; get(name: string): string | undefined },
  ) {
    if (!file) throw new BadRequestException("Choose an image to upload.");
    const host = request.get("host");
    return {
      url: `${request.protocol}://${host}/api/v1/uploads/${encodeURIComponent(file.filename)}`,
      mediaType: file.mimetype,
      size: file.size,
    };
  }
}
