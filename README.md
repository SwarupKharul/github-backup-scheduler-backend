Github Backup Scheduler

## Description
This is a simple backend api that will backup up a github repo locally or on cloud at a given frequency. 

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