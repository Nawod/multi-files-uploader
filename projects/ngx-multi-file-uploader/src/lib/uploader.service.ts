import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UploaderService {

  constructor(private http: HttpClient) { }

    /**
   * check wheather the file is existed
   * or else create a new file path to upload the file 
   */
     uploadRequest(url:any) {
      return this.http.get<any>(
        url
      );
    }

    /**
     * upload and append chunck files to the existing file path
     */
    upload(file:any, url:any, data:any){
    const headers = { "Content-Type": "application/octet-stream" };
    return this.http
    .post<any>(
      url, data, {"headers": headers}
    )
    }
}
