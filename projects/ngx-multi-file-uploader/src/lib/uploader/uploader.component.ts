import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
// import { Observable, Subscription } from 'rxjs';
import { UploaderService } from '../uploader.service';

@Component({
  selector: 'lib-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})
export class UploaderComponent implements OnInit {
  @Input() fileList : any[];
  @Input() uploadRequestURL : any;
  @Input() uploadURL : any;
  @Input() chunkSize : number;
  @Input() projectId : any;
  @Input()
  uploadButtonEvent!: Subject<any>;
  isUploading : boolean;
  currentFileIndex : any;
  lastUploadedFileIndex : any;
  currentChunkIndex : any;

  @Output() progress = new EventEmitter<any>();
  @Output() logs = new EventEmitter<any>();

  constructor(
    private _uploadService: UploaderService,
  // private eventSubscription: Subscription,

  ) { 
    this.chunkSize = 6000000;
    this.isUploading = false;
    this.currentFileIndex = 0;
    this.currentChunkIndex = 0;
    this.projectId = ''
    this.fileList = [];
    }

  ngOnInit(): void {
    console.log("uploader initailized")

    this.uploadButtonEvent.subscribe(event=> {
      this.isUploading = event;
      if(event){
        console.log("Initial request")
        this.requestNewUpload()
      }
    })
  }
  ngOnDestroy(): void {
    this.uploadButtonEvent.unsubscribe()
  }

   //make initial upload request
   requestNewUpload () {
    const fileIndex = this.currentFileIndex;
    const file = this.fileList[fileIndex];

    const params = new URLSearchParams();
    params.set("name", file.name);
    params.set("projectId", this.projectId);
    params.set("chunkSize", (this.chunkSize).toString());

    const url =
    this.uploadRequestURL + params.toString();

    this._uploadService.uploadRequest(url).subscribe(
      (res) => {
      console.log("from upload request", res);

      const fileId = res.fileId;
      const totalChunks = Math.ceil(this.fileList[fileIndex].size / this.chunkSize);
      const existedChunks = res.existedChunks;

      if (res.exists) {
        console.log("file already exists with ", existedChunks, "chunks from ", totalChunks);
        this.logs.emit(`file already exists with ${existedChunks} chunks from ${totalChunks}`);
        this.progress.emit({currentFileIndex:this.currentFileIndex, currentChunkIndex:this.currentChunkIndex,totalChunks:totalChunks })

        if (totalChunks === existedChunks) {
          file.completed = true;
          console.log("File ", fileIndex + 1, " - Existed");
          this.logs.emit(`File ${fileIndex +1} Existed`);

          this.currentFileIndex = fileIndex + 1;
          this.currentChunkIndex = 0;

          if (fileIndex < this.fileList.length - 1 && this.isUploading) {
            console.log("Trigerd from request:", this.currentFileIndex);

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
      console.log("error from upload request: ", error);
      this.logs.emit("Network Error!");
      setTimeout(() => {
        this.logs.emit("Network Error! Try to Reconnect...");
        console.log("Try to reconnect from request!");
        this.requestNewUpload();
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

    this.logs.emit(`file uploading! Uploaded Chunks : ${this.currentChunkIndex} of ${totalChunks}`);

    const params = new URLSearchParams();
    params.set("name", file.name);
    params.set("size", file.size);
    params.set("fileId", fileId);
    params.set("currentChunkIndex", this.currentChunkIndex);
    params.set("totalChunks", (totalChunks).toString());
    params.set("chunkSize", (this.chunkSize).toString());

    const url = "http://104.154.225.244:4001/upload?" + params.toString();

    if (this.isUploading) {
      this._uploadService.upload(file,url,data).subscribe(
        (res) => {
          console.log("from upload", res);
          const existedChunks = res.existedChunks;
        this.progress.emit({currentFileIndex:this.currentFileIndex, currentChunkIndex:this.currentChunkIndex, totalChunks:totalChunks})

          if (res.completed) {
            file.completed = true;
            this.logs.emit(`File ${fileIndex + 1} upload completed!`);
            console.log(fileIndex + 1, " - Uploaded");

            this.currentFileIndex = fileIndex +1
            this.currentChunkIndex = 0;

            if (fileIndex < this.fileList.length - 1 && this.isUploading) {
              console.log("Trigerd from upload :", this.currentFileIndex);
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
          console.log("error from upload: ", error);
          this.logs.emit("Network Error!");
          setTimeout(() => {
            this.logs.emit("Network Error! Try to Reconnect...");
            console.log("Try to reconnect from upload!");
            this.requestNewUpload();
          }, 3000);
        }
        );
    }
  };
}
