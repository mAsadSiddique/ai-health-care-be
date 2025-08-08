"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: `config/${process.env.NODE_ENV}.env` });
const config = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
    entities: [
        'dist/**/*.entity.js'
    ],
    migrations: [
        'src/migration/**/*.ts'
    ],
};
exports.dataSource = new typeorm_1.DataSource(config);
//# sourceMappingURL=ormconfig.js.map