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
   }


}