const authMiddlewarre = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token === process.env.SECRET_KEY) {
            next();
        }
        else {
            res.status(403).json({ message: 'Forbidden' });
        }
    }
    else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = authMiddlewarre;