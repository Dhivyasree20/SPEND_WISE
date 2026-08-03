const { getHealthStatus } = require('../services/healthService');

const getHealth = (req, res) => {
    res.json(getHealthStatus());
};

module.exports = {
    getHealth
};