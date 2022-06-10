import { NgModule } from '@angular/core';
import { NgxMultiFileUploaderComponent } from './ngx-multi-file-uploader.component';
import { UploaderComponent } from './uploader/uploader.component';



@NgModule({
  declarations: [
    NgxMultiFileUploaderComponent,
    UploaderComponent
  ],
  imports: [
  ],
  exports: [
    NgxMultiFileUploaderComponent,
    UploaderComponent
  ]
})
export class NgxMultiFileUploaderModule { }
