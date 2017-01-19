# Cert-Tool

A tool to generate SSL/TLS slef signed certificates

# Install

```bash
npm install -g cert-tool
```

# Usage

```bash
# create root ca certificate
cert-tool create-root-cert <YOUR_CA_NAME>

# create certificate for domain
cert-tool create-root-cert fileName <YOUR_CA_NAME>

# multiple host name in one certificate
cert-tool create-root-cert fileName <YOUR_CA_NAME> www.example.com,example.com,192.168.237.90
```

# Node.js API

### createRootCert(caName)

### createCert(fileName, caName, subDomains)