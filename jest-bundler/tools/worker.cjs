const { transformSync } =  require("@babel/core");

exports.transformESMFiles = function (code) {
    const transformResult = { code: '', errorMessage: '' };

    try {
        transformResult.code = transformSync(code, {
            plugins: ["@babel/plugin-transform-modules-commonjs"]
        }).code;
    } catch (error) {
        transformResult.errorMessage = error.message;
    }

    return transformResult
}
