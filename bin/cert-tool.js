#!/usr/bin/env node

var fs = require('fs');
var os = require('os');
var path = require('path');
var colors = require('colors');

var tool = require('../src/index');

var args = process.argv;
var cmd = args[2] || '';
var func = null;
var tmpPath = path.join(os.homedir(), '.cert-tool');
var option = {};

if(!fs.existsSync(tmpPath)){
    fs.mkdirSync(tmpPath)
}

cmd = cmd.replace(/-(\w)/g, function(match, letter){
    return letter.toUpperCase();
});

func = tool[cmd];

if(typeof func === 'function'){
    func.apply(tool, args.slice(3));
}else if(cmd){
    console.log('[error] `' + cmd + '` not exists.');
}else{
    console.log('Usage:\n');
    console.log('# show certificate output direcotry'.gray);
    console.log('>', 'cert-tool'.bold, 'output-dir'.green);
    console.log();
    console.log('# open certificate output direcotry'.gray);
    console.log('>', 'cert-tool'.bold, 'open'.green);
    console.log();
    console.log('# create root ca certificate'.gray);
    console.log('>', 'cert-tool'.bold, 'create-root-cert'.green, '<YOUR_CA_NAME>'.underline);
    console.log();
    console.log('# create certificate for domain'.gray);
    console.log('>', 'cert-tool'.bold, 'create-cert'.green, '<fileName>'.underline, '<YOUR_CA_NAME>'.underline);
    console.log();
    console.log('# multiple host name in one certificate'.gray);
    console.log('>', 'cert-tool'.bold, 'create-cert'.green, '<fileName>'.underline, '<YOUR_CA_NAME>'.underline, 'www.example.com,example.com,192.168.237.90'.underline);
    console.log();
}