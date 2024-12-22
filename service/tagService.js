import db from '../utils/db.js'


export default {
    getAllTags(){
        return db('tag').orderBy('name', 'asc');
    },
    getTagsForArticle(id){
        return db('tag')
            .join('article_tags', 'tag.id', 'article_tags.tag_id')
            .where('article_tags.article_id', id)
            .select('tag.id', 'tag.name').orderBy('name', 'asc');
    }


}