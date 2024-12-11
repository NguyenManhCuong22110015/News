import knexObj from "knex"

const db = knexObj({
    client: 'mysql2',
    connection:{
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: 'cuong1182004',
        database: 'testdb'
    },
    pool : {min: 0, max: 7}
})

export default db;