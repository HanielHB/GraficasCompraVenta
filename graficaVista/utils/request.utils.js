module.exports = {
    isRequestValid: (requiredFields, body, res) => {
        for (const field of requiredFields) {
            if (!body[field]) {
                res.status(400).json({
                    msg: `Falta el campo ${field}`
                });
                return false;
            }
        }
        return true;
    },
    sendError500 : (res, error) => {
    console.error("Error:", error);
    res.status(500).json({
        message: "Ha ocurrido un error en el servidor.",
        error: error.message || error
    });
},
}