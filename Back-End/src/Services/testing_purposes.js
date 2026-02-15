

const test_route = async (req, res, next) => {
    try {
        console.log("Test route accessed");
        if(res.body) {
            console.log("Request body:", res.body);
        }

        next();
    } catch (error) {
        console.error("Error in test route middleware:", error);
        next(error);
    }
};

module.exports = { test_route };