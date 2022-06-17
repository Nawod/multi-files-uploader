import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UploaderService } from './uploader.service';

export class MultiFileUploader {
  fileList: any[];
  isUploading: boolean;
  attributeSet: attributes;
  currentFileIndex: number;
  currentChunkIndex: number;
  uploaderService: UploaderService;

  logObserve: Subject<any> = new Subject();
  progressObserve: Subject<any> = new Subject();

  constructor(
    private http: HttpClient
  ) {
    this.uploaderService = new UploaderService(http);
    this.fileList = [];
    this.isUploading = false;
    this.currentFileIndex = 0;
    this.currentChunkIndex = 0;
    this.attributeSet = {
      uploadRequestURL: '',
      uploadURL: '',
      chunkSize: 5000000,
      taskId: 0
    };

  }

  //make initial upload request
  requestNewUpload() {

    const fileIndex = this.currentFileIndex;
    const file = this.fileList[fileIndex];

    const params = new URLSearchParams();
    params.set("name", file.name);
    params.set("taskId", this.attributeSet.taskId);
    params.set("chunkSize", (this.attributeSet.chunkSize).toString());
    params.set("currentFileIndex", (this.currentFileIndex).toString());

    const url =
      this.attributeSet.uploadRequestURL + params.toString();
    this.uploaderService.uploadRequest(url).subscribe(
      (res) => {
        console.log("from upload request - pID", this.attributeSet.taskId, res);

        const fileId = res.fileId;
        const totalChunks = Math.ceil(this.fileList[fileIndex].size / this.attributeSet.chunkSize);
        const existedChunks = res.existedChunks;

        if (res.exists) {
          console.log("file", fileIndex + 1, " already exists with ", existedChunks, "chunks from ", totalChunks, "pID : ", this.attributeSet.taskId);
          this.logObserve.next(`file ${fileIndex + 1} already exists with ${existedChunks} chunks from ${totalChunks}`);
          this.progressObserve.next({ currentFileIndex: fileIndex, currentChunkIndex: this.currentChunkIndex, totalChunks: totalChunks })

          if (totalChunks === existedChunks) {
            file.completed = true;
            console.log("File ", fileIndex + 1, " Existed - pID : ", this.attributeSet.taskId);
            this.logObserve.next(`File ${fileIndex + 1} Existed`);
            this.progressObserve.next({ currentFileIndex: fileIndex, currentChunkIndex: this.currentChunkIndex, totalChunks: totalChunks, completed: true })

            this.currentFileIndex = fileIndex === this.fileList.length - 1 ? 0 : fileIndex + 1;
            this.currentChunkIndex = 0;

            if (fileIndex < this.fileList.length - 1 && this.isUploading) {
              console.log("Trigerd from request:", this.currentFileIndex, "pID : ", this.attributeSet.taskId);

              this.requestNewUpload();
            }
          } else {
            this.currentChunkIndex = existedChunks;
            this.readAndUploadCurrentChunk(fileId);
          }
        } else {
          this.readAndUploadCurrentChunk(fileId);
        }
      },
      (error) => {
        console.log("pID : ", this.attributeSet.taskId, " error from upload request: ", error);
        this.logObserve.next("Network Error!");
        setTimeout(() => {
          if (this.isUploading) {
            this.logObserve.next("Network Error! Try to Reconnect...");
            console.log("pID : ", this.attributeSet.taskId, " Try to reconnect from request!");
            this.requestNewUpload();
          }
        }, 3000);
      }
    );
  };

  //split the select file into chunks
  readAndUploadCurrentChunk(fileId: any) {
    if (this.isUploading) {
      const fileIndex = this.currentFileIndex;
      const reader = new FileReader();
      const file = this.fileList[fileIndex];
      if (!file) {
        return;
      }

      const from = this.currentChunkIndex * this.attributeSet.chunkSize;
      const to = from + this.attributeSet.chunkSize;
      const blob = file.slice(from, to);
      reader.onload = (e) => this.uploadChunk(e, fileId);
      reader.readAsDataURL(blob);
    }
  };

  //upload the chunk file
  uploadChunk(readerEvent: any, fileId: any) {
    const fileIndex = this.currentFileIndex;
    const file = this.fileList[fileIndex];
    const data = (readerEvent.target.result);
    const totalChunks = Math.ceil(file.size / this.attributeSet.chunkSize)

    this.logObserve.next(`file ${fileIndex + 1} uploading! Uploaded Chunks : ${this.currentChunkIndex} of ${totalChunks}`);

    const params = new URLSearchParams();
    params.set("name", file.name);
    params.set("fileId", fileId);
    params.set("currentChunkIndex", (this.currentChunkIndex).toString());
    params.set("totalChunks", (totalChunks).toString());
    params.set("chunkSize", (this.attributeSet.chunkSize).toString());
    params.set("currentFileIndex", (this.currentFileIndex).toString());

    const url = this.attributeSet.uploadURL + params.toString();

    if (this.isUploading) {
      this.uploaderService.upload(file, url, data).subscribe(
        (res) => {
          console.log("pID : ", this.attributeSet.taskId, " from upload ", res);
          const existedChunks = res.existedChunks;
          this.progressObserve.next({ currentFileIndex: this.currentFileIndex, currentChunkIndex: this.currentChunkIndex, totalChunks: totalChunks })

          if (res.completed) {
            file.completed = true;
            this.logObserve.next(`File ${fileIndex + 1} upload completed!`);
            this.progressObserve.next({ currentFileIndex: fileIndex, currentChunkIndex: this.currentChunkIndex, totalChunks: totalChunks, completed: true })
            console.log("pID : ", this.attributeSet.taskId, " File ", fileIndex + 1, " - Uploaded");

            this.currentFileIndex = fileIndex === this.fileList.length - 1 ? 0 : fileIndex + 1;
            this.currentChunkIndex = 0;

            if (fileIndex < this.fileList.length - 1 && this.isUploading) {
              console.log("Trigerd from upload :", this.currentFileIndex, "pID : ", this.attributeSet.taskId);
              this.requestNewUpload();
            }
          } else {
            this.currentChunkIndex = existedChunks + 1
            this.readAndUploadCurrentChunk(
              fileId
            );
          }
        },
        (error) => {
          console.log("pID : ", this.attributeSet.taskId, " error from upload: ", error);
          this.logObserve.next("Network Error!");
          setTimeout(() => {
            if (this.isUploading) {
              this.logObserve.next("Network Error! Try to Reconnect...");
              console.log("Try to reconnect from upload!");
              this.requestNewUpload();
            }
          }, 3000);
        }
      );
    }
  };

}

export interface attributes {
  uploadRequestURL: string;
  uploadURL: string;
  chunkSize: number;
  taskId: any;
}