import { S3FileUploader } from './../model/s3-file-uploader';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MultiFileUploader } from 'projects/ngx-multi-file-uploader/src/lib/multi-file-uploader.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // uploadRequestURL = 'http://localhost:4001/upload-request?';
  // uploadURL = 'http://localhost:4001/upload?';
  // uploadRequestURL = 'http://104.154.225.244:4001/upload-request?';
  // uploadURL = 'http://104.154.225.244:4001/upload?';

  // _uploader: MultiFileUploader;
  fileList: any[] = [];
  logs: any = 'Chose files';
  isUploading: boolean = false;
  currentFileIndex : number = 0;

  constructor(
    private _s3FileUploader: S3FileUploader,
  ) {
    // this._uploader = new MultiFileUploader(http)
  }

  ngOnInit(): void {
    //get upload status from the library
    this._s3FileUploader.logObserve.subscribe(event => {
      this.logs = event
      console.log("logs : ",event)
    })
    this._s3FileUploader.progressObserve.subscribe(event => {
      if (event?.uplodedFileIndex != this.fileList.length - 1) {
        console.log("file ", event.uplodedFileIndex, "uploaded")
        this.currentFileIndex = event.uplodedFileIndex + 1
        this.uploadNextFile()
      } else {
        this.isUploading = false;
        this._s3FileUploader.isUploading = false;
        this.fileList = []
        console.log("upload completed")
      }
    })
  }

  // testClick(){
  //   this._s3FileUploader.fileName = "new name";
  //   this._s3FileUploader.start()
  // }

  ngOnDestroy(): void {
    //destroy the event listners
    this._s3FileUploader.logObserve.unsubscribe()
    this._s3FileUploader.progressObserve.unsubscribe()
  }

  //Initiate values for uploader library and call the initail uploading request
  uploadButtonHandler() {
    if (this.fileList.length > 0) {
      this._s3FileUploader.isUploading = !this.isUploading;
      this.isUploading = !this.isUploading;

      if (this.isUploading) {
        this._s3FileUploader.currentFileIndex = this.currentFileIndex;
        this._s3FileUploader.fileName = this.fileList[this.currentFileIndex].name;
        this._s3FileUploader.file = this.fileList[this.currentFileIndex];
        this._s3FileUploader.start()
      }
    }
  }

  uploadNextFile(){
    if (this.isUploading) {
      this._s3FileUploader.uploadedParts = []
      this._s3FileUploader.currentFileIndex = this.currentFileIndex;
      this._s3FileUploader.fileName = this.fileList[this.currentFileIndex].name;
      this._s3FileUploader.file = this.fileList[this.currentFileIndex];
      this._s3FileUploader.start()
    }
  }

  //append the selected files to file list and pass it to the library
  addFile(event: any):void {
    this.fileList = [...this.fileList, ...event.target.files]
  }

  onCancel():void {
    if (this.isUploading) {
      this._s3FileUploader.abort()
      this.fileList = []
    }
  }
}
