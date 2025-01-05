import express from 'express'
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import globalErrorHandler from './controllers/errorController.js'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import AppError from './utils/AppError.js'

const app = express()

app.use(cors())

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100,
})

app.use(limiter)
app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler)


export default app;