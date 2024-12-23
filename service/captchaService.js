export default {
    /**
     * Handles GET requests to provide the hCaptcha sitekey.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    async getHCaptchaSiteKey(req, res) {
        try {
            const HCAPTCHA_SITE_KEY = HCAPTCHA_SITEKEY; // Replace with your hCaptcha site key.

            res.status(200).json({
                success: true,
                siteKey: HCAPTCHA_SITE_KEY,
            });
        } catch (error) {
            console.error('Error fetching hCaptcha site key:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch hCaptcha site key.' });
        }
    },
};