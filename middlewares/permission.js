function permission(allowedUsers) {
    const isAllowed = type => allowedUsers.indexOf(type) > -1;
    return (req, res, next) => {
        // console.log(req.userType, allowedUsers, isAllowed(req.userType))
        if (isAllowed(req.userType)) {
            next();
        } else {
            res.status(401).json({
                message: 'Not authorized to access'
            })
        }
    }
};
module.exports = permission;