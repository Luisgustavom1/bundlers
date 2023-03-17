export const convertOutputArrayToObj = (output) => {
    return output
        .reduce((acc, { path, code }) => ({
            ...acc,
            [path]: code
        }), {});
}