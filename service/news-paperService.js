import db from "../utils/db.js";

export default {
    add(title, content, summary, category, tags, userId) {
        
        return db("articles").insert({
            title: title,
            summary: summary,
            content: content,
            category_id: category,
            status: 'draft',
            writer_id: userId,
        })
        
    },
    update(id,title, content, summary, category, tags, userId) {
        return db("articles").update({
            title: title,
            summary: summary,
            content: content
        }).where("id", id)
        
    }
};
