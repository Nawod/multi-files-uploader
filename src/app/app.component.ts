import { Component } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  uploadButtonEvent : Subject<any> = new Subject();
  fileList : any[] = [];
  uploadRequestURL = 'http://104.154.225.244:4001/upload-request?';
  uploadURL = 'http://104.154.225.244:4001/upload?';
  logs: any = 'Chose files';
  isUploading:boolean = false;
  chunkSize = 5000000;
  taskId = '1234a';

  uploadButtonEvent2 : Subject<any> = new Subject();
  fileList2 : any[] = [];
  logs2: any = 'Chose files';
  isUploading2:boolean = false;
  taskId2 = '1234b';

  getProgress(results :  any){
    // console.log(results)
  }

  getLogs(results :  any){
    this.logs = results;
    // console.log("results" ,results)
  }

  uploadButtonHandler(){
    if(this.fileList.length > 0){
    this.isUploading = !this.isUploading;
    this.uploadButtonEvent.next(this.isUploading);
    }
  }

  addFile(event:any){
    this.fileList = [...this.fileList, ...event.target.files]
  }

  getLogs2(results :  any){
    this.logs2 = results;
    // console.log("results" ,results)
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
