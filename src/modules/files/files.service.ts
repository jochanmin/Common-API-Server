import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { Files } from './entities/file.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NOT_FOUND_FILE_KEY,
  UNKNOWN_ERR,
} from '../../common/constants/error.constant';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(Files) private readonly fileRepository: Repository<Files>,
    private readonly s3: S3,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(fileInBody: Express.Multer.File) {
    const { size, mimetype, originalname } = fileInBody;
    const uploadResult = await this.s3
      .upload({
        Bucket: this.configService.get('file.aws_s3_bucket_name'),
        Key: `files/${new Date().valueOf()}/${originalname}`,
        Body: fileInBody.buffer,
        ContentType: fileInBody.mimetype,
      })
      .promise();
    const file = await this.fileRepository.save({
      key: uploadResult.Key,
      size,
      mimetype,
      original_name: originalname,
      url: uploadResult.Location,
    });
    return file;
  }

  async deleteFile(key: string) {
    const file = await this.fileRepository.findOne({ key });
    if (!file) {
      throw new NotFoundException(NOT_FOUND_FILE_KEY);
    }
    const response = await this.s3
      .deleteObject({
        Bucket: this.configService.get('file.aws_s3_bucket_name'),
        Key: key,
      })
      .promise();
    if (!response) {
      throw new InternalServerErrorException(UNKNOWN_ERR);
    }
    await this.fileRepository.delete({ key });
  }
}
