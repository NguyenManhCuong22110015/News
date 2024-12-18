import db from '../utils/db.js';

export default {
    async getReasonByArticleID(article_id){
        try {
            const reason = await db('reason').where('article_id', article_id).first(); // Adjust table name if necessary
            return reason; // Returns a single user object
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    },
    async saveReason(article_id, reason) {
        try {
            await db('reason').insert({
                article_id: article_id,
                reason: reason
            });
        } catch (error) {
            console.error('Error saving reason:', error);
            throw error; 
        }
    },
    async addAcceptInfo(article_id, tag_id, category_id, publish_date) {

        try {
            const [insertedId] = await db('accept').insert({
                article_id: article_id,
                tag_id: tag_id,
                category_id: category_id,
                publish_date: publish_date
            });

            return insertedId;
        } catch (error) {
            console.error('Error inserting accept info:', error);
            throw error;
        }
    }
}