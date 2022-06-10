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
  chunkSize = 50120;
  projectId = '1234a';

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
    console.log(event.target.files)
  }
}
