import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UploaderService } from './uploader.service';

export class MultiFileUploader {
    fileList : any[];
    uploadRequestURL : string;
    uploadURL : string;
    chunkSize : number;
    taskId : any;
    isUploading : boolean;
    currentFileIndex : number;
    lastUploadedFileIndex : number;
    currentChunkIndex : number;
    uploaderService: UploaderService;

    logObserve : Subject<any> = new Subject();
    progressObserve : Subject<any> = new Subject();

    constructor(
        private http: HttpClient
    ) {
        this.uploaderService = new UploaderService(http);
        this.uploadRequestURL = '';
        this.uploadURL = '';
        this.taskId = ''
        this.fileList = [];
        this.chunkSize = 5000000;
        this.isUploading = false;
        this.currentFileIndex = 0;
        this.currentChunkIndex = 0;
        this.lastUploadedFileIndex = 0;
    
    }
    
//make initial upload request
   requestNewUpload () {
       
    const fileIndex = this.currentFileIndex;
    const file = this.fileList[fileIndex];

    const params = new URLSearchParams();
    params.set("name", file.name);
    params.set("projectId", this.taskId);
    params.set("chunkSize", (this.chunkSize).toString());

    const url =
    this.uploadRequestURL + params.toString();
    this.uploaderService.uploadRequest(url).subscribe(
      (res) => {
      console.log("from upload request - pID", this.taskId, res);

      const fileId = res.fileId;
      const totalChunks = Math.ceil(this.fileList[fileIndex].size / this.chunkSize);
      const existedChunks = res.existedChunks;

      if (res.exists) {
        console.log("file", fileIndex +1 ," already exists with ", existedChunks, "chunks from ", totalChunks, "pID : ", this.taskId);
        this.logObserve.next(`file ${fileIndex + 1} already exists with ${existedChunks} chunks from ${totalChunks}`);
        this.progressObserve.next({currentFileIndex:fileIndex, currentChunkIndex:this.currentChunkIndex,totalChunks:totalChunks })

        if (totalChunks === existedChunks) {
          file.completed = true;
          console.log("File ", fileIndex + 1, " Existed - pID : ", this.taskId);
          this.logObserve.next(`File ${fileIndex +1} Existed`);

          this.currentFileIndex = fileIndex + 1;
          this.currentChunkIndex = 0;

          if (fileIndex < this.fileList.length - 1 && this.isUploading) {
            console.log("Trigerd from request:", this.currentFileIndex , "pID : ", this.taskId);

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
      console.log("pID : ", this.taskId," error from upload request: ", error);
      this.logObserve.next("Network Error!");
      setTimeout(() => {
        if (this.isUploading) {
        this.logObserve.next("Network Error! Try to Reconnect...");
        console.log("pID : ", this.taskId," Try to reconnect from request!");
        this.requestNewUpload();
        }
      }, 3000);
    }
    );
  };

    //split the select file into chunks
    readAndUploadCurrentChunk(fileId : any){
        if (this.isUploading) {
          const fileIndex = this.currentFileIndex;
          const reader = new FileReader();
          const file = this.fileList[fileIndex];
          if (!file) {
            return;
          }
    
          const from = this.currentChunkIndex * this.chunkSize;
          const to = from + this.chunkSize;
          const blob = file.slice(from, to);
          reader.onload = (e) => this.uploadChunk(e, fileId);
          reader.readAsDataURL(blob);
        }
      };

 //upload the chunk file
  uploadChunk(readerEvent:any, fileId:any){
    const fileIndex = this.currentFileIndex;
    const file = this.fileList[fileIndex];
    const data = (readerEvent.target.result);
    const totalChunks = Math.ceil(file.size / this.chunkSize)

    this.logObserve.next(`file ${fileIndex+1} uploading! Uploaded Chunks : ${this.currentChunkIndex} of ${totalChunks}`);

    const params = new URLSearchParams();
    params.set("name", file.name);
    params.set("size", file.size);
    params.set("fileId", fileId);
    params.set("currentChunkIndex", (this.currentChunkIndex).toString());
    params.set("totalChunks", (totalChunks).toString());
    params.set("chunkSize", (this.chunkSize).toString());

    const url = this.uploadURL + params.toString();

    if (this.isUploading) {
     this.uploaderService.upload(file,url,data).subscribe(
        (res) => {
          console.log("pID : ", this.taskId, " from upload ", res);
          const existedChunks = res.existedChunks;
          this.progressObserve.next({currentFileIndex:this.currentFileIndex, currentChunkIndex:this.currentChunkIndex, totalChunks:totalChunks})

          if (res.completed) {
            file.completed = true;
            this.logObserve.next(`File ${fileIndex + 1} upload completed!`);
            console.log("pID : ", this.taskId ," File " ,fileIndex + 1, " - Uploaded");

            this.currentFileIndex = fileIndex +1
            this.currentChunkIndex = 0;

            if (fileIndex < this.fileList.length - 1 && this.isUploading) {
              console.log("Trigerd from upload :", this.currentFileIndex, "pID : ", this.taskId);
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
          console.log("pID : ", this.taskId," error from upload: ", error);
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
