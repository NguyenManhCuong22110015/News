import knexObj from "knex"

const db = knexObj({
    client: 'mysql2',
    connection:{
        host: 'salu0.h.filess.io',
        port: '3307',
        user: 'News_makingfox',
        password: '40f9046bcd54c93d96a48d2277c336f08f111b3d',
        database: 'News_makingfox'
    },
    pool : {min: 0, max: 7}
})

export default db;