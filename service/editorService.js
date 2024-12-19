import db from '../utils/db.js';

export default {
    getArticlesForCategories(userId) {
        return db('editor_category as ec')
            .join('articles as a', 'ec.category_id', 'a.category_id')
            .select('a.*')
            .where('ec.user_id', userId)
            .andWhere('status', 'draft')
            .orderBy('a.created_at', 'desc');
    },
}