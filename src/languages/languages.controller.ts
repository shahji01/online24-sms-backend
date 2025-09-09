import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { Response } from 'express';
import { IntegerType } from 'typeorm';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Post()
  async create(
    @Body()
    dto: {
      translations: { lang_code: string; lang_name: string; }[];
    },
    @Res() response: Response,
  ) {
    const result = await this.languagesService.create(dto);
    return response
      .status(result.success ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST)
      .json(result);
  }

  @Get()
  async findAll(
    @Res() res: Response,
    @Headers('accept-language') lang: string,
    @Query('status') status?: number,
  ) {
    try {
      const languages = await this.languagesService.findAll(status);
      return res.status(HttpStatus.OK).json(languages);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch languages.',
        error: error.message,
      });
    }
  }

  // @Put(':id')
  // async update(
  //   @Param('id') id: number,
  //   @Body() dto: {
  //     translations: {
  //       lang_code: string;
  //       lang_name: string;
  //     }[];
  //   },
  //   @Res() response: Response,
  // ) {
  //   const result = await this.languagesService.update(id, dto.translations);
  //   return response
  //     .status(result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST)
  //     .json(result);
  // }
}
