import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MultiFileUploader } from 'projects/ngx-multi-file-uploader/src/lib/multi-file-uploader.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  _uploader: MultiFileUploader;
  logObserve!: Subject<any>;

  uploadButtonEvent : Subject<any> = new Subject();
  fileList : any[] = [];
  uploadRequestURL = 'http://localhost:4001/upload-request?';
  uploadURL = 'http://localhost:4001/upload?';
  // uploadRequestURL = 'http://104.154.225.244:4001/upload-request?';
  // uploadURL = 'http://104.154.225.244:4001/upload?';
  logs: any = 'Chose files';
  isUploading:boolean = false;
  chunkSize = 50000;
  taskId = '1234a';

  uploadButtonEvent2 : Subject<any> = new Subject();
  fileList2 : any[] = [];
  logs2: any = 'Chose files';
  isUploading2:boolean = false;
  taskId2 = '1234b';

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
      console.log("Success ", event)
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
    this._uploader.taskId = this.taskId;
    this._uploader.uploadRequestURL = this.uploadRequestURL;
    this._uploader.uploadURL = this.uploadURL;
    this._uploader.chunkSize = this.chunkSize

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


  uploadButtonHandler2(){
    if(this.fileList2.length > 0){
    this.isUploading2 = !this.isUploading2;
    this.uploadButtonEvent2.next(this.isUploading2);
    }
  }

  addFile2(event:any){
    this.fileList2 = [...this.fileList2, ...event.target.files]
  }

}
