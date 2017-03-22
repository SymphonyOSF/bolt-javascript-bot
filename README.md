# Bolt Javascript Bot for Symphony

A very simple javascript bot meant to be used as a base template to create more complicated chat bots on Symphony.

## Requirements

- Idea of what you want the bot to do!
- Your own pod
- API Agent Library installed either on the cloud or on-premise
- A Service Account for the Bot that can be created in your pod's Admin Portal
- Security Certificates for Bot Authentication, with one of the certificate upload to the Admin Portal^
- Symphony REST API Documentation Access @ https://developers.symphony.com
- NodeJS/NPM installed. This is only tested to work on v6.9.1

^ (certificates should be obtained from your internal PKI infrastructure, or refer to Certificate Generator for Windows PDF Instructions for more information)

## Instructions

1) Run `npm install` to install all the node modules dependencies.

2) Place your .pem and .p12 certificates in the /certs folder

3) In the config.js file, fill in your own pod and agent API library endpoints (POD_URL, AGENT_URL, AGENT_URL2, SESSION_ENDPOINT, KEY_MANAGER_ENDPOINT)

4) In the same config.js file, fill in the filepath to the appropriate certificate and certificate key as well as the certificate passphrase (CERT_FILE_PATH, CERT_KEY_FILE_PATH, CERT_PASSPHRASE)

5) You may now run `npm start`. This runs the server that can be accessed on localhost:4000

6) The script will attempt to authenticate to your pod as well as your key manager to obtain both the pod session token as well as a key manager token.

7) You should be able to now search for your bot (Bolt) and chat with it either in an IM or CHATROOM! It should have an online status.

8) By default, the bot is filtering for `/bolt` and `/bolt $TICKER` in your chat message. You can modify this and more in the `parseMessage` function in api.js

## Credits

Bolt is created by Jeff Lam Tian Hung. It can be used and modified freely, with no expectation of any support whatsoever.
