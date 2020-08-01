function accessVerification(access) {
    const isAllowed = accessRights => accessRights.indexOf(access) > -1;
    return (req, res, next) => {
        if (req.userType === "employee") {
            if (isAllowed(req.accessRights)) {
                next();
            } else {
                res.status(401).json({
                    message: 'Have no access'
                })
            }
        } else {
            next();
        }

    }
};
module.exports = accessVerification;