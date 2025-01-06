import db from '../utils/db.js';

export default {
    async getDataFromDatabase(id) {
        return db('articles')
            .join('category', 'articles.category_id', '=', 'category.id')
            .join('users as u', 'articles.writer_id', '=', 'u.id')
            .select('articles.*', 'category.name as category_name', 'u.name as writer_name')
            .where('articles.id', id)
            .first();
    }
}