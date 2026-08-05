const getHealth = (req, res) => {
    res.json({
        success: true,
        message: 'Server is running'
    });
};

module.exports = {
    getHealth
};