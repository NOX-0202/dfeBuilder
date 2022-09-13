export const extractInt = (str) => parseInt(str.replace(/[^0-9]/g, ''));


export const verifyTpIntrega = code => {
    const codes = ['03', '04'];

    if (codes.includes(code)) {
        return 2;
    } else {
        return null
    }

}