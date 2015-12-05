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
node server
```

Start client app:
```
node client/index
```

## Client Usage

First you will be asked to enter your `USERNAME`. If the `USERNAME` was never used, it creates a new workspace, generates new keys and signs the public key by CA. If the `USERNAME` was already used (the `workspaces/USERNAME` exists), it just tells the program that you want to use this particular workspace.

Then you have to call `init-session HOSTNAME` to start a secure channel.

**Welcome interface:**
```
node client/index
What is your username (workspace)? USERNAME
s2dr:USERNAME> init-session https://localhost:4433
Welcome back USERNAME! Secure channel is ready!
s2dr:USERNAME>
s2dr:USERNAME>
s2dr:USERNAME> help
```

**You can also use normal bash commands** (cwd is set to the selected USERNAME workspace):
```
s2dr:USERNAME> ls
s2dr:USERNAME> touch t1.txt
```

**List all s2dr available commands via:**
```
s2dr:USERNAME> help
```

## Some reading...

[https://engineering.circle.com/https-authorized-certs-with-node-js/](https://engineering.circle.com/https-authorized-certs-with-node-js/)
