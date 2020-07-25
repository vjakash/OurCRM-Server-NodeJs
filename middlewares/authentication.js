const jwt = require('jsonwebtoken');

async function authenticate(req, res, next) {
    if (req.headers.authorization === undefined) {
        res.status(401).json({
            message: 'Token not present'
        })
    } else {
        jwt.verify(req.headers.authorization, 'qwertyuiopasdfghjkl', (err, decode) => {
            if (err) {
                res.status(400).json({
                    message: 'session expired'
                });
            } else {
                console.log(decode);
                req.userType = decode.userType;
                if (req.accessRights === []) {
                    req.accessRights = ["view"]
                }
                req.accessRights = decode.accessRights
                next();
            }
        })
    }
};
module.exports = authenticate;