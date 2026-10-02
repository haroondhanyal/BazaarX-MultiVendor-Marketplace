import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post } from "@nestjs/common";
import { IsArray, IsIn, IsString, MaxLength, MinLength } from "class-validator";
import { PersistentMap } from "../../common/persistent-map";

interface ApplicationRecord {
  id: string;
  answers: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  updatedAt: string;
  reviewNote?: string;
}
const applications = new PersistentMap<string, ApplicationRecord>("seller-applications");

class ApplicationDto {
  @IsArray() @IsString({ each: true }) @MaxLength(500, { each: true }) answers!: string[];
}
class DecisionDto {
  @IsIn(["APPROVED", "REJECTED"]) status!: ApplicationRecord["status"];
  @IsString() @MinLength(3) @MaxLength(500) note!: string;
}

@Controller("sellers")
export class SellersController {
  @Post("applications") submit(@Body() body: ApplicationDto) {
    if (body.answers.length !== 7 || body.answers.some((answer) => !answer.trim())) {
      throw new BadRequestException("Complete all seven onboarding sections before submitting.");
    }
    const now = new Date().toISOString();
    const application: ApplicationRecord = {
      id: `SELLER-${Date.now()}`,
      answers: body.answers.map((answer) => answer.trim()),
      status: "PENDING",
      submittedAt: now,
      updatedAt: now,
    };
    applications.set(application.id, application);
    return application;
  }

  @Get("applications") list() {
    return { data: [...applications.values()].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)) };
  }

  @Patch("applications/:id") decide(@Param("id") id: string, @Body() body: DecisionDto) {
    const application = applications.get(id);
    if (!application) throw new NotFoundException("Seller application not found.");
    application.status = body.status;
    application.reviewNote = body.note.trim();
    application.updatedAt = new Date().toISOString();
    applications.set(id, application);
    return application;
  }
}
