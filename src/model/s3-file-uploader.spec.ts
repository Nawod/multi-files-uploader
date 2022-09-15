import { S3FileUploader } from './s3-file-uploader';

describe('S3FileUploader', () => {
  it('should create an instance', () => {
    expect(new S3FileUploader()).toBeTruthy();
  });
});
