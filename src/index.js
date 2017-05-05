/**
 * @file
 * @author zdying
 */

'use strict';
var fs = require('fs');
var os = require('os');
var path = require('path');
var child_process = require('child_process');
var SSL_ROOT = path.join(__dirname, 'config');
var ROOT_CA_CONF = path.join(SSL_ROOT, 'root_ca.cnf');
var DOMAIN_CERT_CONF = path.join(SSL_ROOT, 'domain_cert.cnf');
var DOMAIN_CERT_SAN_CONF = path.join(SSL_ROOT, 'domain_cert_san.cnf');
var OUTPUT_PATH = path.join(os.homedir(), '.cert-tool');

module.exports = {
    'outputDir': function(){
        console.log(OUTPUT_PATH);
    },

    'open': function(){
        openFinder(OUTPUT_PATH);
    },

    /**
     * 创建Root CA证书
     * @param caName
     */
    'createRootCert': function(caName){
        caName = caName || 'DefaultCA';

        var keyPath = path.join(OUTPUT_PATH, caName + '.key');
        var pemPath = path.join(OUTPUT_PATH, caName + '.pem');

        if(fs.existsSync(keyPath) && fs.existsSync(pemPath)){
            console.log('Root CA `' + caName + '` already exists.');
        }else{
            child_process.execSync('openssl genrsa -out ' + keyPath + ' 2048');
            child_process.execSync(
                [
                    'openssl req -x509 -new -nodes -sha256 -days 3650',
                    '-key ' + keyPath,
                    '-out ' + pemPath,
                    // '-config ' + ROOT_CA_CONF
                ].join(' '),
                {
                    stdio: "inherit",
                    stdin: process.stdin,
                    stdout: process.stdout
                }
            );
        }

        console.log('\n');
        console.log('Root CA created success, file name: ' + caName + '.key & ' + caName + '.pem');
        console.log('\n');

        openFinder(OUTPUT_PATH);
    },

    /**
     * 创建单域名证书
     * @param fileName
     * @param caName
     */
    'createCert': function(fileName, caName, subDomains){
        caName = caName || 'DefaultCA';
        
        var domains = subDomains ? subDomains.split(/\s*,\s*/) : [];
        var caFileName = path.join(OUTPUT_PATH, caName);
        var domainFileName = path.join(OUTPUT_PATH, fileName);

        var keyPath = domainFileName + '.key';
        var crtPath = domainFileName + '.crt';
        var csrPath = domainFileName + '.csr';

        var caKeyPath = caFileName + '.key';
        var caPemPath = caFileName + '.pem';

        var isSAN = domains.length > 1;
        var domainConf = isSAN ? '' : DOMAIN_CERT_CONF;

        if(fs.existsSync(keyPath) && fs.existsSync(crtPath)){
            console.log('The certificate for `' + fileName + '` already exists.');
            return;
        }

        if(!fs.existsSync(caPemPath) || !fs.existsSync(caKeyPath)){
            this['createRootCert'](caName);
        }

        if(isSAN){
            var sanConf = fs.readFileSync(DOMAIN_CERT_SAN_CONF);
            var altNamesStr = getAltNames(domains);

            domainConf = path.join(OUTPUT_PATH, fileName + '_tmp_conf.cnf');

            fs.writeFileSync(domainConf, sanConf + altNamesStr);
        }

        var privateKeyCMD = ['openssl genrsa -out', keyPath, '2048'].join(' ');
        var csrCMD = ['openssl req -new -key', keyPath, '-out', csrPath, '-config', domainConf].join(' ');
        var certCMD = [
            'openssl x509 -req -in', csrPath, '-CA', caPemPath, '-CAkey', caKeyPath,
            '-CAcreateserial -out', crtPath,
            '-days 500 -sha256',
            isSAN ? '-extensions v3_req -extfile ' + domainConf : ''
        ].join(' ');

        console.info('[step 1] create private key:'.bold.green, privateKeyCMD.bold);
        child_process.execSync(privateKeyCMD);

        console.info('[step 2] generate the certificate signing request:'.bold.green, csrCMD.bold);
        child_process.execSync(
            csrCMD,
            {
                stdio: "inherit",
                stdin: process.stdin,
                stdout: process.stdout
            }
        );

        console.info('[step 3] sign the CSR:'.bold.green, certCMD.bold);
        child_process.execSync(
            certCMD
        );

        console.log('\n\n');
        console.log('Certificate created success, file name: ' + (fileName + '.key & ' + fileName + '.pem').bold.green);
        console.log('\n\n');

        openFinder(OUTPUT_PATH);

        if(isSAN && domainConf !== DOMAIN_CERT_SAN_CONF){
            fs.unlink(domainConf);
        }
    }
};

function openFinder(_path){
    var os = require('os');

    if(os.platform() === 'win32'){
        child_process.execSync('start "" "' + _path + '"');
    }else{
        child_process.execSync('open ' + _path);
    }
}

function getAltNames(domains){
    var dns = [];
    var ip = [];
    var ipReg = /^(\d{1,3}\.){3}(\d{1,3})$/;

    domains.forEach(function(domain){
        if(ipReg.test(domain.trim())){
            ip.push('IP.' + (ip.length + 1) + ' = ' + domain);
        }else{
            dns.push('DNS.' + (dns.length + 1) + ' = ' + domain);
        }
    });

    return '\n' + dns.concat(ip).join('\n');
}