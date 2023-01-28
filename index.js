const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')
const mime = require('mime-types')
const path = require('path')
global.creator = `@neoxrs – Wildan Izzudin`

const SCOPES = [
   'https://www.googleapis.com/auth/drive',
   'https://www.googleapis.com/auth/drive.file',
   'https://www.googleapis.com/auth/drive.appdata',
   'https://www.googleapis.com/auth/drive.apps.readonly',
   'https://www.googleapis.com/auth/drive.readonly',
   'https://www.googleapis.com/auth/drive.metadata.readonly',
   'https://www.googleapis.com/auth/drive.metadata'
]

module.exports = (credentials_path, token_path) => {
   if (!fs.existsSync(credentials_path)) {
      class Gdrive {
         error = 'Credentials file are required, get it on here => https://console.cloud.google.com/apis/'
      }
      return Gdrive
   } else if (!fs.existsSync(token_path)) {
      class Gdrive {
         error = 'Token file are required, get it on here => https://developers.google.com/oauthplayground/'
      }
      return Gdrive
   } else {
      const credentials = JSON.parse(fs.readFileSync(credentials_path, 'utf-8'))
      const token = JSON.parse(fs.readFileSync(token_path, 'utf-8'))
      const {
         client_secret,
         client_id,
         redirect_uris
      } = credentials.web
      const oAuth2Client = new google.auth.OAuth2(
         client_id,
         client_secret,
         redirect_uris[0]
      )

      oAuth2Client.setCredentials({
         refresh_token: token.refresh_token,
         access_token: token.access_token
      })

      class Gdrive {
         AuthClient = oAuth2Client
         GoogleDrive = google.drive({
            version: "v3",
            auth: oAuth2Client
         })

         /**
          * check if folder is exists in drive
          * @param {string} name folder name 
          * @returns 
          */
         checkFolderExists = (name) => {
            return new Promise(async resolve => {
               try {
                  const check = await this.GoogleDrive.files.list({
                     q: "mimeType='application/vnd.google-apps.folder' and name='" + name + "'  and trashed=false ",
                     spaces: 'drive'
                  })
                  if (check.data.files.length) {
                     resolve({
                        creator: global.creator,
                        status: true,
                        data: {
                           exists: true,
                           id: check.data.files[0].id
                        }
                     })
                  } else {
                     resolve({
                        creator: global.creator,
                        status: false,
                        data: {
                           exists: false,
                           id: ''
                        }
                     })
                  }
               } catch (error) {
                  console.log(error)
                  resolve({
                     creator: global.creator,
                     status: false,
                     msg: error.message
                  })
               }
            })
         }

         /**
          * create folder in google drive
          * @param {string} name folder name
          * @param {string} parentId folder id
          * @returns 
          */
         createFolder = (name, parentId) => {
            return new Promise(async resolve => {
               try {
                  let body = {
                     name: name,
                     mimeType: 'application/vnd.google-apps.folder'
                  }
                  if (parentId) {
                     body['parents'] = [parentId];
                  }
                  const response = await this.GoogleDrive.files.create({
                     requestBody: body,
                     fields: 'id'
                  })
                  if (response.status != 200) return resolve({
                     creator: global.creator,
                     status: false
                  })
                  resolve({
                     creator: global.creator,
                     status: true,
                     data: response.data
                  })
               } catch (error) {
                  console.log(error)
                  resolve({
                     creator: global.creator,
                     status: false,
                     msg: error.message
                  })
               }
            })
         }

         /**
          * get file & info from google drive
          * @param {string} url
          * @returns 
          */
         getFile = (url) => {
            return new Promise(async resolve => {
               try {
                  let fileInfo = await this.GoogleDrive.files.get({
                     fileId: url.split('/')[5]
                  })
                  if (fileInfo.status != 200) return resolve({
                     creator: global.creator,
                     status: false
                  })
                  let response = await this.GoogleDrive.files.get({
                     fileId: url.split('/')[5],
                     alt: 'media',
                  }, {
                     responseType: "arraybuffer"
                  })
                  if (response.status != 200) return resolve({
                     creator: global.creator,
                     status: false
                  })
                  resolve({
                     creator: global.creator,
                     status: true,
                     data: {
                        ...fileInfo.data,
                        chunk: response.data
                     }
                  })
               } catch (error) {
                  console.log(error)
                  resolve({
                     creator: global.creator,
                     status: false,
                     msg: error.message
                  })
               }
            })
         }
         
         /**
          * get file list form google drive
          * @param {Object} options
          * @returns 
          */
         fileList = (options = {}) => {
            return new Promise(async resolve => {
               try {
                  let response = await this.GoogleDrive.files.list(options)
                  if (response.status != 200) return resolve({
                     creator: global.creator,
                     status: false
                  })
                  resolve({
                     creator: global.creator,
                     status: true,
                     data: response.data
                  })
               } catch (error) {
                  console.log(error)
                  resolve({
                     creator: global.creator,
                     status: false,
                     msg: error.message
                  })
               }
            })
         }

         /**
          * upload file to google drive
          * @param {string} filePath path of the file
          * @param {string} parentId folder id
          * @returns 
          */
         uploadFile = (filePath, parentId) => {
            return new Promise(async resolve => {
               try {
                  let body = {
                     name: path.basename(filePath),
                     parents: [parentId], //Optional and make sure to replace with your folder id.
                  }
                  let media = {
                     body: fs.createReadStream(filePath),
                     mimeType: mime.lookup(filePath)
                  }
                  const response = await this.GoogleDrive.files.create({
                     requestBody: body,
                     fields: 'id',
                     media: media
                  })
                  if (response.status != 200) return resolve({
                     creator: global.creator,
                     status: false
                  })
                  resolve({
                     creator: global.creator,
                     status: true,
                     data: response.data
                  })
               } catch (error) {
                  resolve({
                     creator: global.creator,
                     status: false,
                     msg: error.message
                  })
               }
            })
         }
      }
      return Gdrive
   }
}