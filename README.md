# s2dr
Secure Shared Data Repository for CS6238 Secure Computer Systems

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v4 is required)
- [Npm](https://www.npmjs.com/) (v3 is required, comes usually with node.js)
- [OpenSSL](https://www.openssl.org) (v0.9.8zg, preinstalled with OSX/Linux)

## Installing

```
git clone git@github.com:tajo/s2dr.git
cd s2dr
npm install
```

## Running

Start server:
```
node server/index
```

Start client app:
```
node client/index
```

## Info

Get help in the client via
```
s2dr> help
```

## Client Usage

All commands must be ran from the project root.

First you **have to always call `init-workspace USERNAME`**. If the `USERNAME` was never used, it creates a new workspace, generates new keys and signs the public key by CA. If the `USERNAME` was already used (the `workspaces/USERNAME` exists), it just tells the program that you want to use this particular workspace.

Then you have to call `init-session HOSTNAME` to start a secure channel.

Code:
```
node client/index
s2dr> init-workspace USERNAME
s2dr> init-session https://localhost:4433
```

## Some reading...

[https://engineering.circle.com/https-authorized-certs-with-node-js/](https://engineering.circle.com/https-authorized-certs-with-node-js/)


