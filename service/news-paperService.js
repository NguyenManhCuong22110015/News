import db from "../utils/db.js";

export default {
    async add(title, content, summary, category, tags, userId, isPremium) {
        try {
            const [articleId] = await db("articles")
                .insert({
                    title,
                    summary,
                    content,
                    category_id: category,
                    writer_id: userId,
                    status: 'draft',
                    is_premium: isPremium
                })
                
    
            // Insert tags after article
            if (tags && tags.length > 0) {
                await db("article_tags")
                    .insert(tags.map(tagId => ({
                        article_id: articleId,
                        tag_id: tagId
                    })));
            }
    
            return articleId;
        } catch (error) {
            console.error('Error adding article:', error);
            throw error;
        }
    },
    update(id,title, content, summary, category, tags, userId) {
        return db("articles").update({
            title: title,
            summary: summary,
            content: content,
            category_id: category,
            status: 'draft'
        }).where("id", id)
        .then(() => {
            return db('article_tags')
                .where('article_id', id)
                .del()
                .then(() => {
                    return db('article_tags')
                        .insert(tags.map(tagId => ({ article_id: id, tag_id: tagId })));
                });
        });
        
    }
};
