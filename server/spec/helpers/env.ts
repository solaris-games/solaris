// Provide fallback values for required config keys so that the config module
// does not throw at import time when running tests without a .env file (e.g. CI).
process.env.SESSION_SECRET ||= "test-session-secret";
process.env.CONNECTION_STRING ||= "mongodb://localhost:27017/solaris-test";
process.env.SERVER_URL ||= "http://localhost:3000";
process.env.CLIENT_URL ||= "http://localhost:8080";

export {};
