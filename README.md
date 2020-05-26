# cli-ossutil
> ossutil cli

### install
```
> npm install cli-ossutil --save-dev
```

### usage
```
> cli-ossutil
  Usage: cli-ossutil [options]
  --src                local path
  --target             remote path
  --accessKeyId        config : your oss accessKeyId
  --accessKeySecret    config : your oss accessKeySecret
  --bucket             config : your oss bucket
  --region             config : your oss region
  --config             config file def: ./ossutil-config.json
  --help               show help
```

`ossutil-config.json`

```json
{
  "region": "oss-cn-beijing",
  "accessKeyId": "your oss accessKeyId",
  "accessKeySecret": "your oss accessKeySecret",
  "bucket": "your oss bucket"
}
```