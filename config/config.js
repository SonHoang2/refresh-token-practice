import dotenv from 'dotenv'

dotenv.config()

export default {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database: {
        name: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        ATExpiresIn: process.env.JWT_AT_EXPIRES_IN,
        RTExpiresIn: process.env.JWT_RT_EXPIRES_IN,
        ATCookieExpiresIn: process.env.JWT_AT_COOKIE_EXPIRES_IN,
        RTCookieExpiresIn: process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN
    },
}