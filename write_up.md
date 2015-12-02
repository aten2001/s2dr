#S2DR (CS 6238)

**Authors:** Vojtech Miksu, Brian Lebiednik

**Date:** 12/04/2015

```
Our program accomplishes all of the the implementation instructions as described.
```

## Usage

### Prerequisites

- Node.js
- Npm
- OpenSSL

### Install

- npm install

## Running

Start server:
```
node server/index
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

## Protocol Details
The program runs an HTTPS server with the Node.js. When the client initiates the session with the server, the server challenges the client with a certificate request during the TLS handshake. Both the client and the server have 4096 bit RSA keys that they request the CA to sign as part of their initialization. After the client have a trusted connection, they share a socket for further communication. This connection is persistent until the client terminates the connection. 
From the socket the client can call all of the required functions. The messages appear to the server with the hostname, socket, and requested action. If the hostname and key of the client do not match during initialization, the server will reject the socket and deny access. The sever knows based off the hostname which active workspace to access as long as the socket is still valid. From this the server can access the active workspace and store or retrieve files for the client.  
The orginal owner or delegated user has several options during the delegation call. The owner is allowed to set the propagtion flag of the file for the other users that the owner delegates access. The owner or delegated user places a max time on the delegation for checking in the algorithm. The communication of the file, client, and permission then are passed to the server. The server checks that file and client exist and that they request is valid. This  
The server checks all request against its access control list for the file requested. The rules for delegation first check the owner of the document and then the delegation rules set on the file by the owner or delegated user. The further algorithm can be found in 'is_allowed.js'. Teh server checks teh permissions of the file to see if the the userid is in them or 'all' then checks if 'check-in', 'check-out', or 'both are present and finally checks the time to ensure that the permission is still valid. 
   

## Security Analysis

### Communication security
The security of the communication between the client and server is based on the security of a 4096 bit RSA key and the use of OpenSSL. The socket communication in the client server commmunication remeainssecure tithe the signing and encrypting of the messages. There are no known attacks to this type of communication. 

### Code security 
Provide some review of the code or documentation on the 

## Contributions
Vojtech Miksu conducted the coding and optimization of the project. His work was instrumental to accomplishing all of the goals set forth in the requirements document. He provided the configurations for the server and client as well as securing the communication between them.

Brian Lebiednik provided code review and documentation. He worked the product to ensure that it accomplished all of the security reviews. He also authored the report for the project and provided proofing.

## Conclusion


