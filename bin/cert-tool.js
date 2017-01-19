#!/usr/bin/env node

var fs = require('fs');
var os = require('os');
var path = require('path');

var tool = require('../src/index');

var args = process.argv;
var cmd = args[2];
var func = null;
var tmpPath = path.join(os.homedir(), '.cert-tool');

if(!fs.existsSync(tmpPath)){
    fs.mkdirSync(tmpPath)
}

cmd = cmd.replace(/-(\w)/g, function(match, letter){
    return letter.toUpperCase();
});

func = tool[cmd];

if(typeof func === 'function'){
    func.apply(tool, args.slice(3));
}else{
    console.log('[error] `' + args[2] + '` not exists.');
}