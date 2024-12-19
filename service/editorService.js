import db from '../utils/db.js';

export default {
    getArticlesForCategories(userId) {
        return db('editor_category as ec')
            .join('article as a', 'ec.category_id', 'a.category_id')
            .select('a.*')
            .where('ec.user_id', userId);
    },
}