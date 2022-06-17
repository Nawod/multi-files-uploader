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
  chunkSize = 500000;
  uploadRequestURL = 'http://104.154.225.244:4001/upload-request?';
  uploadURL = 'http://104.154.225.244:4001/upload?';

  _uploader: MultiFileUploader;
  fileList : any[] = [];
  logs: any = 'Chose files';
  isUploading:boolean = false;
  attributeSet = {
    uploadRequestURL : this.uploadRequestURL,
    uploadURL : this.uploadURL,
    chunkSize : this.chunkSize,
    taskId : '1234a'
  }

  constructor (
    private http: HttpClient
  ) {
    this._uploader = new MultiFileUploader(http)
  }

  ngOnInit(): void{
    //get upload status from the library
    this._uploader.logObserve.subscribe(event=> {
      this.logs = event
    })
    this._uploader.progressObserve.subscribe(event=>{
      if(event.completed && event.currentFileIndex === this.fileList.length - 1){
        this.isUploading = false;
        this._uploader.isUploading = false;
        this.fileList = []
      }
    })
  }

  ngOnDestroy(): void {
    //destroy the event listners
    this._uploader.logObserve.unsubscribe()
    this._uploader.progressObserve.unsubscribe()
  }

  //Initiate values for uploader library and call the initail uploading request
  uploadButtonHandler(){
    if(this.fileList.length > 0){
    this._uploader.isUploading = !this.isUploading;
    this._uploader.attributeSet = this.attributeSet;

    this.isUploading = !this.isUploading;

    if(this.isUploading){
    this._uploader.requestNewUpload()
    }
    }
  }

  //append the selected files to file list and pass it to the library
  addFile(event:any){
    this.fileList = [...this.fileList, ...event.target.files]
    this._uploader.fileList = this.fileList
  }
}
