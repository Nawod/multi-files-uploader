import { Injectable } from '@angular/core';
import { UploadrService } from './../service/uploadr.service';

@Injectable({
    providedIn: 'root'
  })

export class S3FileUploader {
    chunkSize : number;
    threadsQuantity : number;
    file : any;
    fileName : string;
    aborted : boolean;
    uploadedSize : number;
    progressCache : any;
    activeConnections : any;
    parts : Array<any>;
    uploadedParts : Array<any>;
    fileId : any;
    fileKey : any;
    onProgressFn = () => {}
    onErrorFn = () => {}

    constructor(
        private _uploaderService: UploadrService,
    ) {
        this.chunkSize = 1024 * 1024 * 5
        this.threadsQuantity = Math.min( 5, 15)
        this.file = []
        this.fileName = 'file'
        this.aborted = false
        this.uploadedSize = 0
        this.progressCache = {}
        this.activeConnections = {}
        this.parts = []
        this.uploadedParts = []
        this.fileId = null
        this.fileKey = null
        this.onProgressFn = () => {}
        this.onErrorFn = () => {}
    }

    /**
     * start to initialize
     * new multipart upload
     */
    start():void {
        // console.log(this.fileName);
        this.initialize()
      }
    
    /**
     * initilize the multifile upload
     */
    async initialize() {
        try {
          let fileName = this.fileName
          const ext = this.file.name.split(".").pop()
          if (ext) {
            fileName += `.${ext}`
          }
    
          const videoInitializationUploadInput = {
            name: fileName,
          }

          this._uploaderService
            .initializeMultipartUpload(videoInitializationUploadInput)
            .subscribe(
                (response: any) => {
                    this.getPresignedUrls(response);
                },
                (error: any) => {
                    console.log("multipart initailzing error :", error)
                }
            );

        } catch (error) {
            await this.complete(error)
          }
    }

    /**
     * get presigned access urls
     * @param initializeReponse 
     */
    async getPresignedUrls(initializeReponse: any){
        try {
          const AWSFileDataOutput = initializeReponse.data
    
          this.fileId = AWSFileDataOutput.fileId
          this.fileKey = AWSFileDataOutput.fileKey
    
          const numberOfparts = Math.ceil(this.file.size / this.chunkSize)
    
          const AWSMultipartFileDataInput = {
            fileId: this.fileId,
            fileKey: this.fileKey,
            parts: numberOfparts,
          }
    
           this._uploaderService
            .getPresignedUrls(AWSMultipartFileDataInput)
            .subscribe(
                (response: any) => {
                    const newParts = response.data.parts
                    this.parts.push(...newParts)
            
                    this.sendNext()
                },
                (error: any) => {
                    console.log("getting urls error :", error)
                }
            );
        } catch (error) {
          await this.complete(error)
        }
      }
    
      /**
       * putting the part whose upload failed back into the queue
       * @returns null
       */
      sendNext():void {
        const activeConnections = Object.keys(this.activeConnections).length
    
        if (activeConnections >= this.threadsQuantity) {
          return
        }
    
        if (!this.parts.length) {
          if (!activeConnections) {
            this.complete()
          }
    
          return
        }
    
        const part = this.parts.pop()
        if (this.file && part) {
          const sentSize = (part.PartNumber - 1) * this.chunkSize
          const chunk = this.file.slice(sentSize, sentSize + this.chunkSize)
    
          const sendChunkStarted = () => {
            this.sendNext()
          }
    
          this.sendChunk(chunk, part, sendChunkStarted)
            .then(() => {
              this.sendNext()
            })
            .catch((error) => {
              this.parts.push(part)
    
              this.complete(error)
            })
        }
      }
    
      async complete(error?:any) {
        if (error && !this.aborted) {
        //   this.onErrorFn(error)
            console.log("abroat 1", error);
          return
        }
    
        if (error) {
        //   this.onErrorFn(error)
        console.log("abroat 2", error);
          return
        }
    
        try {
          await this.sendCompleteRequest()
        } catch (error) {
        //   this.onErrorFn(error)
        console.log("abroat 3", error);
        }
      }
    
      /**
       * finsh the upload
       */
      async sendCompleteRequest() {
        if (this.fileId && this.fileKey) {
          const videoFinalizationMultiPartInput = {
            fileId: this.fileId,
            fileKey: this.fileKey,
            parts: this.uploadedParts,
          }

          this._uploaderService
            .finalizeUpload(videoFinalizationMultiPartInput)
            .subscribe(
                (response: any) => {
                },
                (error: any) => {
                    console.log("finalize error :", error)
                }
            );
        }
      }
    
      /**
       * uplaod the chunck files
       * @param chunk 
       * @param part 
       * @param sendChunkStarted 
       * @returns 
       */
      sendChunk(chunk : any, part:any, sendChunkStarted:any) {
        return new Promise<void>((resolve, reject) => {
          this.upload(chunk, part, sendChunkStarted)
            .then((status) => {
              if (status !== 200) {
                reject(new Error("Failed chunk upload"))
                return
              }
    
              resolve()
            })
            .catch((error) => {
              reject(error)
            })
        })
      }
    
      /**
       * handle the uploading progress
       * @param part 
       * @param event 
       */
      handleProgress(part:any, event:any):void {
        if (this.file) {
          if (event.type === "progress" || event.type === "error" || event.type === "abort") {
            this.progressCache[part] = event.loaded
          }
    
          if (event.type === "uploaded") {
            this.uploadedSize += this.progressCache[part] || 0
            delete this.progressCache[part]
          }
    
          const inProgress = Object.keys(this.progressCache)
            .map(Number)
            .reduce((memo, id) => (memo += this.progressCache[id]), 0)
    
          const sent = Math.min(this.uploadedSize + inProgress, this.file.size)
    
          const total = this.file.size
    
          const percentage = Math.round((sent / total) * 100)
    
        //   this.onProgressFn({
        //     sent: sent,
        //     total: total,
        //     percentage: percentage,
        //   })
        }
      }
    
      /**
       * uploading each part with its pre-signed URL
       * @param file 
       * @param part 
       * @param sendChunkStarted 
       * @returns 
       */
      upload(file:any, part:any, sendChunkStarted:any) {
        return new Promise((resolve, reject) => {
          if (this.fileId && this.fileKey) {
            const xhr = (this.activeConnections[part.PartNumber - 1] = new XMLHttpRequest())
    
            sendChunkStarted();
    
            const progressListener = this.handleProgress.bind(this, part.PartNumber - 1)
    
            xhr.upload.addEventListener("progress", progressListener)
    
            xhr.addEventListener("error", progressListener)
            xhr.addEventListener("abort", progressListener)
            xhr.addEventListener("loadend", progressListener)
    
            xhr.open("PUT", part.signedUrl)
    
            xhr.onreadystatechange = () => {
              if (xhr.readyState === 4 && xhr.status === 200) {
                const ETag = xhr.getResponseHeader("ETag")
    
                if (ETag) {
                  const uploadedPart = {
                    PartNumber: part.PartNumber,
                    ETag: ETag.replaceAll('"', ""),
                  }
    
                  this.uploadedParts.push(uploadedPart)
    
                  resolve(xhr.status)
                  delete this.activeConnections[part.PartNumber - 1]
                }
              }
            }
    
            xhr.onerror = (error) => {
              reject(error)
              delete this.activeConnections[part.PartNumber - 1]
            }
    
            xhr.onabort = () => {
              reject(new Error("Upload canceled by user"))
              delete this.activeConnections[part.PartNumber - 1]
            }
    
            xhr.send(file)
          }
        })
      }
    
      onProgress(onProgress:any) {
        this.onProgressFn = onProgress
        return this
      }
    
      onError(onError:any) {
        this.onErrorFn = onError
        return this
      }
    
      abort() {
        Object.keys(this.activeConnections)
          .map(Number)
          .forEach((id) => {
            this.activeConnections[id].abort()
          })
    
        this.aborted = true
      }
}

