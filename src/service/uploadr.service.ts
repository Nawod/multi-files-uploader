import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UploadrService {
  apiUrl = "http://localhost:3000"
  // headers = { "Content-Type": "application/octet-stream" };

  constructor(private _http: HttpClient) {}

  /**
   * initialize multipart file upload
   * @param data 
   * @returns any
   */
  initializeMultipartUpload(data: any): any {
    return this._http.post<any>(
      `${this.apiUrl}/uploads/initializeMultipartUpload`,data
      // `${this.apiUrl}/uploads/initializeMultipartUpload`,data, {"headers": headers}
    );
  }

  /**
   * get presigned urls to get upload files
   * @param data 
   * @returns 
   */
  getPresignedUrls(data: any): any {
    return this._http.post<any>(
      `${this.apiUrl}/uploads/getMultipartPreSignedUrls`,data
    );
  }

  /**
   * finsh the upload
   * @param data 
   * @returns 
   */
  finalizeUpload(data: any): any {
    return this._http.post<any>(
      `${this.apiUrl}/uploads/finalizeMultipartUpload`,data
    );
  }
}
