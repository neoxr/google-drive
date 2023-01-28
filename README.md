# @neoxr/google-drive

Library to operate with Google Drive API v3 from Node.js, using system user tokens or personal keys.

### How to create a Service Account

1. Go to the [Google Developers Console](https://console.developers.google.com/project)
2. Select your project or create a new one (and then select it)
3. Enable the Drive API for your project

- In the sidebar on the left, expand **APIs & auth** > **APIs**
- Search for "drive"
- Click on "Drive API"
- click the blue "Enable API" button

4. Create a service account for your project

- In the sidebar on the left, expand **APIs & auth** > **Credentials**
- Click blue "Add credentials" button
- Select the "Service account" option
- Select "Furnish a new private key" checkbox
- Select the "JSON" key type option
- Click blue "Create" button
- your JSON key file is generated and downloaded to your machine (**it is the only copy!**)
- note your service account's email address (also available in the JSON key file)

5. Share the doc (or docs) with your service account using the email noted above

### How to get Access Token

Go to the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)

1. Select **Drive API v3** and check all scopes
2. Enter this _https://www.googleapis.com/auth/drive_ at the **Authorize API** form (Dont click the button)
3. Click gear icon on the top right corner
4. Check **Use your own OAuth credentials**
5. Enter your **client_id** and **client_secret**
6. Back to **Authorize API** form and click the button
7. Select your gmail account
8. Copy response header at the right side
9. Save as `token.json`

### Connect to Google Drive

Let's say you stored your user credentials in a file called `credentials.json` and token as `token.json`. And you gave permission to the service account's email address.

```js
const Authorize = require('@neoxr/google-drive')
const drive = new(Authorize('./path/credentials.json', './path/token.json'))

console.log(drive)
```

### Check Folder Exists

```js
drive.checkFolderExists('folder_name').then(res => console.log(res))
```

### Create Folder

```js
drive.createFolder('my_new_folder').then(res => console.log(res))
```

### Download File

```js
const fs = require('fs')
drive.getFile('https://drive.google.com/file/d/1hzgrW1rWCvfNmE2CYKov2z8zmzOzSGfq/view?usp=drivesdk').then(res => {
   if (!res.status) {
      console.log('Error!')
   } else {
      fs.writeFileSync('./video.mp4', Buffer.from(res.data.chunk))
      console.log('File downloaded!')
   }
})
```

### Show File List

```js
drive.fileList().then(res => console.log(res))

// filter by mimeType
drive.fileList({
   q: "mimeType='video/mp4'"
}).then(res => console.log(res))

```

### Upload File

```js
const fs = require('fs')
const Buffer = fs.readFileSync('./path/video.mp4')
// Example Folder : https://drive.google.com/drive/folders/1-hTAMXNpTS0o_RNSKAtUEyJm3fGzwYUy
const folderId = '1-hTAMXNpTS0o_RNSKAtUEyJm3fGzwYUy'
drive.uploadFile(Buffer, folderId).then(res => console.log(res))
```

### Create Function by Docs

If you want to use the function from [Google Drive Docs](https://developers.google.com/drive/api/guides/about-sdk) use `drive.GoogleDrive`, for example :

```js
const createPermissions = async (drive, fileId) => {
   // Return the Promise result after completing its task
   return new Promise((resolve, reject) => {
      const body = {
         "role": "reader",
         "type": "anyone"
      }
      return drive.GoogleDrive.permissions.create({
         fileId,
         resource: body
      }, (err, results) => err ? reject(err) : resolve(results))
   })
}
```

### Important

You have to put this on the app at 60 minute intervals to refresh the token.

```js
setInterval(() => {
   drive.GoogleDrive.refreshAccessToken((error, token) => {
         if (!error) {
            drive.GoogleDrive.setCredentials({
               refresh_token: token.refresh_token,
               access_token: token.access_token
            })
         })
   }
   else console.log(error)
})
```

### 乂  License
Copyright (c) 2022 Neoxr . Licensed under the [GNU GPLv3](https://github.com/neoxr/google-drive/blob/master/LICENSE)