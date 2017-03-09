let config = {
	POD_URL: 'https://REPLACE.WITH.YOUR.API.ENDPOINT.com:8444/pod/v1',
	AGENT_URL: 'https://REPLACE.WITH.YOUR.API.ENDPOINT.com:8444/agent/v1',
	AGENT_URL2: 'https://REPLACE.WITH.YOUR.API.ENDPOINT.com:8444/agent/v2',
	SESSION_ENDPOINT: 'https://REPLACE.WITH.YOUR.API.ENDPOINT.com:8444/sessionauth/v1/authenticate',
	KEY_MANAGER_ENDPOINT: 'https://REPLACE.WITH.YOUR.API.ENDPOINT.com:8444/keyauth/v1/authenticate',

	CERT_FILE_PATH: './certs/bot-name_cert-cert.pem',
	CERT_KEY_FILE_PATH: './certs/bot-name_cert-key.pem',
	CERT_PASSPHRASE: '1234',

	USERNAME: 'bot-name',
	PASSWORD: 'password',

	SESSION_TOKEN: '',
	KM_TOKEN: '',

	BOT_ID: '',
	STREAM_ID: ''
}

export default config
