import knexObj from "knex"

const db = knexObj({
    client: 'mysql2',
    connection:{
        host: 'dpg-cumvku8gph6c738amcsg-a',
        port: '5432',
        user: 'cuong_user',
        password: 'pyu0JR6meTD2UCor1FUjFLZKv8N1JMpt',
        database: 'cuong'
    },
    pool : {min: 0, max: 7}
})

export default db;
