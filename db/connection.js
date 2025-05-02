const { Pool } = require("pg");

const ENV = process.env.NODE_ENV || 'development'

const config = {}

if (ENV === "production") {
    config.connectionString = process.env.DATABASE_URL;
    config.max = 2
}

require('dotenv').config({path: `${__dirname}/../.env.${ENV}`})

const db = new Pool(config);

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
    throw new Error("No PGDATABASE or DATABASE_URL set")
} else { 
    console.log(`Connected to ${process.env.PGDATABASE}`)
}


module.exports = db;
module.exports = new Pool(config)