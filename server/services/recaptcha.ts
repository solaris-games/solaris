import { Config } from "../config/types/Config";

const Recaptcha = require('recaptcha-v2').Recaptcha;

export default class RecaptchaService {

    config: Config;

    constructor (
        config: Config
    ) {
        this.config = config;
    }

    isEnabled() {
        return this.config.google.recaptcha.enabled;
    }

    verify(ipAddress: string, token: string): Promise<void> {
        let siteKey = this.config.google.recaptcha.siteKey;
        let secretKey = this.config.google.recaptcha.secretKey;
    
        return new Promise((resolve, reject) => {
            if (!this.isEnabled()) {
                resolve();
            }
    
            let data = {
                remoteip: ipAddress,
                response: token,
                secret: secretKey
            };
        
            let recaptcha = new Recaptcha(siteKey, secretKey, data);
        
            recaptcha.verify((success: boolean, error_code: string) => {
                if (success) {
                    resolve();
                }
                else {
                    reject(error_code);
                }
            });
        });
    }

};
