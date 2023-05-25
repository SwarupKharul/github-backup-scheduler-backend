# Github Backup Scheduler

## Description
This is a simple backend api that will backup up a github repo locally or on cloud at a given frequency. 

## Tech Stack
- Node.js
- Express.js
- MongoDB
- Docker
- Infura IPFS

## Installation
1. Clone the repo
2. Run `npm install`
3. Run `npm start`
4. Go to `http://localhost:3000/` to use the API

## Docker Installation
1. Clone the repo
2. Run `docker compose build`
3. Run `docker compose up`
4. Go to `http://localhost:3000/` to use the API

## Usage
### Create a new backup
`POST /backup`

#### Parameters
| Name | Type | Description |
| ---- | ---- | ----------- |
| `repositoryUrl` | `string` | **Required**. The github repo to backup. |
| `frequency` | `string` | **Required**. The frequency of the backup. Can be `daily`, `weekly`, or `monthly`. |
| `type` | `string` | **Required**. The location to backup the repo. Can be `local` or `cloud`. |

#### Example
```bash
curl -X POST \
  http://localhost:3000/backup \
  -H 'Content-Type: application/json' \
  -d '{
    "repository_url": "https://github.com/SwarupKharul/github-backup-scheduler-backend",
    "frequency": "daily",
    "type": "cloud"
    }'
```

#### Response
```json
{
    "message":  "Backup scheduled successfully",
}
```


### Get all backups
`GET /schedule`

#### Example
```bash
curl -X GET \
  http://localhost:3000/backup
```

#### Response
```json
[
  {
    "_id": "646efe8dfbcd3042566b57b3",
    "repository": "https://github.com/SwarupKharul/github-backup-scheduler-backend",
    "backupFrom": "Thu May 25 2023 11:52:05 GMT+0530 (India Standard Time)",
    "backupFrequency": "now",
    "backupType": "zip",
    "lastBackup": "Thu May 25 2023 11:53:03 GMT+0530 (India Standard Time)",
    "CIDs": [
      "QmRUe89nMA2dhWh1Z7UK8xxEPFZ95YEHKAjWShZx59kjJY",
      "QmRUe89nMA2dhWh1Z7UK8xxEPFZ95YEHKAjWShZx59kjJY"
    ],
    "__v": 1
  }
]
```

### Delete a backup
`DELETE /schedule/:CID`

#### Example
```bash
curl -X DELETE \
  http://localhost:3000/schedule/QmRUe89nMA2dhWh1Z7UK8xxEPFZ95YEHKAjWShZx59kjJY
```

#### Response
```json
{
    "status": 200,
    "message": "Backup deleted successfully"
}
```

## Deployed API
The API is deployed on Azure. You can access it at `http://4.224.18.83:3000/`