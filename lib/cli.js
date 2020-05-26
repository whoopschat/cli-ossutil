#!/usr/bin/env node
const alioss = require('ali-oss');
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const program = minimist(process.argv.slice(2), []);

let config = {};
let configPath = path.posix.join(process.cwd(), program.config || './ossutil-config.json');
if (fs.existsSync(configPath)) {
    Object.assign(config, require(configPath))
}

if (program.accessKeyId) {
    config.accessKeyId = program.accessKeyId;
}
if (program.accessKeySecret) {
    config.accessKeySecret = program.accessKeySecret;
}
if (program.bucket) {
    config.bucket = program.bucket;
}
if (program.region) {
    config.region = program.region;
}

if (program.help) {
    console.log("");
    console.log("");
    console.log("Usage: cli-ossutil [options]");
    console.log("  --src                src path");
    console.log("  --target             target path");
    console.log("  --accessKeyId        config : your oss accessKeyId");
    console.log("  --accessKeySecret    config : your oss accessKeySecret");
    console.log("  --bucket             config : your oss bucket");
    console.log("  --region             config : your oss region");
    console.log("  --config             config file def: ./ossutil-config.json");
    console.log("  --help               show help");
    console.log("");
    console.log("");
    return;
}

if (!config.accessKeyId) {
    console.log('ERROR:invalid parameters [accessKeyId]');
    console.log('');
    return false;
}
if (!config.accessKeySecret) {
    console.log('ERROR:invalid parameters [accessKeySecret]');
    console.log('');
    return false;
}
if (!config.region) {
    console.log('ERROR:invalid parameters [region]');
    console.log('');
    return false;
}
if (!config.bucket) {
    console.log('ERROR:invalid parameters [bucket]');
    console.log('');
    return false;
}

if (!program.src) {
    console.log('ERROR:invalid parameters [src]');
    console.log('');
    return false;
}

if (!program.target) {
    console.log('ERROR:invalid parameters [target]');
    console.log('');
    return false;
}

const client = new alioss(config);

console.log('');
console.log(`[OSSUTIL] START UPLOADING... oss://${config.bucket}/${program.target}`);
console.log('');

let list = _list(path.posix.join(process.cwd(), program.src));

let allNumber = list.length
let tmpNumber = 0;
let sucNumber = 0;
let retNumber = 0;
let sizeNumber = 0;


if (list.length > 0) {
    list.forEach(item => {
        _upload(item)
    });
} else {
    _result();
}

function _result() {
    if (allNumber === tmpNumber) {
        console.log('');
        console.log(`[OSSUTIL] RESULT :   ${_renderSize(sizeNumber)} - [ SIZE ]   ${allNumber} - [ ALL ]   ${sucNumber} - [ SUCCESS ]   ${retNumber} - [ RETRY ]`)
        console.log('');
    }
}

function _upload(item, retry = true) {
    client.put(`${program.target}${item.relative}`, item.file).then(() => {
        sucNumber++;
        tmpNumber++;
        sizeNumber += item.size;
        console.log(`[OSSUTIL] 【 ${item.file} 】SUCCESS   ✔ 【${_renderSize(item.size)}】`)
        _result();
    }).catch(() => {
        if (retry) {
            _upload(item, false);
        } else {
            retNumber++;
            tmpNumber++;
            console.log(`[OSSUTIL] 【 ${item.file} 】FAILURE   ✘ `);
            _result();
        }
    });
}

function _list(src) {
    let entrysList = [];
    const fetchFile = (file) => {
        if (!fs.existsSync(file)) {
            return;
        }
        let fileStat = fs.statSync(file);
        if (fileStat.isDirectory()) {
            const fileList = fs.readdirSync(file);
            if (!fileList.length) {
                return;
            }
            fileList.forEach(item => {
                fetchFile(path.posix.join(file, `./${item}`))
            })
        } else {
            entrysList.push({ file, relative: path.posix.relative(src, file), size: fileStat.size });
        }
    }
    fetchFile(src);
    return entrysList;
}

function _renderSize(value) {
    if (null == value || value == '') {
        return "0 Bytes";
    }
    var unitArr = new Array("Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
    var index = 0;
    var srcsize = parseFloat(value);
    index = Math.floor(Math.log(srcsize) / Math.log(1024));
    var size = srcsize / Math.pow(1024, index);
    size = size.toFixed(2);
    return size + unitArr[index];
}