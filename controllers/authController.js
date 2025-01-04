import catchAsync from "../utils/catchAsync.js";
import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import jwt from 'jsonwebtoken';
import config from "../config/config.js";

export const protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.cookie) {
        token = req.headers.cookie.replace("access_token=", "");
    }
    if (!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access', 401)
        );
    }
    // verification token
    const decoded = jwt.verify(token, config.jwt.secret);
    // check if user still exists
    const currentUser = await User.findOne(
        {
            where: {
                id: decoded.id,
                active: true
            }
        });
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exits.',
                401
            ));
    }
    // check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    req.user = currentUser;
    next();
})

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin, ...]  .role = 'user'
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError("You do not have permission to perform this action", 403)
            )
        }
        next();
    }
}

const signToken = (id, time) => {
    return jwt.sign({ id }, config.jwt.secret, {
        expiresIn: time
    })
}

const createSendToken = (user, statusCode, res) => {
    const accessToken = signToken(user.id, config.jwt.ATExpiresIn);
    const refreshToken = signToken(user.id, config.jwt.RTExpiresIn);

    res.cookie('access_token', accessToken, {
        expires: new Date(
            Date.now() + config.jwt.ATCookieExpiresIn * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false // cookie only send on secure connection (https)
    });

    res.cookie('refresh_token', refreshToken, {
        expires: new Date(
            Date.now() + config.jwt.RTCookieExpiresIn * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        path: '/refresh-token'
    });

    // remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        data: {
            user
        }
    })
}

export const login = catchAsync(
    async (req, res, next) => {
        const { email, password } = req.body;

        if (!email || !password) {
            next(new AppError('Please provide email and password!', 400));
        }

        const user = await User.scope('withPassword').findOne({ where: { email: email } });

        if (!user || !user.validPassword(password)) {
            next(new AppError('Incorrect email or password', 401));
        }

        if (!user.active) {
            next(new AppError('Your account has been deactivated and can no longer be used.', 401));
        }

        createSendToken(user, 200, res);
    }
)

export const signup = catchAsync(
    async (req, res, next) => {

    }
);


export const logout = (req, res) => {

}
