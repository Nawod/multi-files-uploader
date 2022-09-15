import { S3FileUploader } from './../model/s3-file-uploader';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
  import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxMultiFileUploaderModule } from 'NgxMultiFileUploader';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxMultiFileUploaderModule,
    HttpClientModule,
    CommonModule,
  ],
  providers: [
    HttpClientModule,
    S3FileUploader
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
