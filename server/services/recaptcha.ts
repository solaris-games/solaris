const Recaptcha = require('recaptcha-v2').Recaptcha;

export default class RecaptchaService {

    isEnabled() {
        return process.env.GOOGLE_RECAPTCHA_ENABLED === 'true';
    }

    verify(ipAddress: string, token: string): Promise<void> {
        let siteKey = process.env.GOOGLE_RECAPTCHA_SITE_KEY;
        let secretKey = process.env.GOOGLE_RECAPTCHA_SECRET_KEY;
    
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
