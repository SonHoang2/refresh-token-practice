'use strict';
import app from "./app.js";
import config from "./config/config.js";
import sequelize from "./db.js";
import User from "./models/userModel.js";
import { connectRedis } from './redisClient.js';

try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

const db = {
    User
};


Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// sequelize.sync({ force: true })

await connectRedis();

const port = config.port || 5000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
