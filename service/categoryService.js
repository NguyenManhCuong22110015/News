import db from '../utils/db.js';

export default {

    getAll(){
        return db("category");
    },
   add(name, description) {        
    const addDate =new Date().toISOString().slice(0, 19).replace('T', ' ');
    return db("category").insert({
        name: name,
        description: description,
        created_at: addDate,
        updated_at: addDate
    })
    .then(() => {
        return db("category").select("id").orderBy("id", "desc").limit(1);
    })
}
,
   findById(id){
       return db("category").where("id", id).first();
   },


   del(id){
       return db("category").where("id", id).del();
   },

   patch(id,category){
       return db("category").where("id", id).update(category);
   },
    async getAll() {
        return db('category as c1')
            .leftJoin('category as c2', 'c1.parent_id', 'c2.id')
            .select('c1.*', 'c2.name as parent_name');
    },

    async getAllParents() {
        return db('category')
            .where('parent_id', 0)
            .select('*');
    },
    async updateParent(id, parent_id) {
        return db('category')
            .where('id', id)
            .update({ parent_id });
    },

    findByName(name){
        return db("category").where("name", name).first();
    },
    getCategory(id) {
        return db("editor_category")
            .join("category", "editor_category.category_id", "=", "category.id")
            .select("editor_category.*", "category.name as category_name")
            .where("editor_category.user_id", id);
    },
    getUnassignedCate(id) {
        return db("category")
            .whereNotIn("id", function() {
                this.select("category_id")
                    .from("editor_category")
                    .where("user_id", id);
            })
            .select("*");
    },
    delCatForEditor(id) {
        return db("editor_category")
            .where("id", id)
            
            .del();
    },
    addCat(userId, categoryId) {
        return db("editor_category")
            .insert({
                user_id: userId,
                category_id: categoryId
            })
    }



}