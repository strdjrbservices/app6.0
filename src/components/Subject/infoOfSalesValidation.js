export const checkInfoOfSalesFieldsNotBlank = (field, text) => {
    const fieldsToCheck = [
        "There are ____ comparable properties currently offered for sale in the subject neighborhood ranging in price from$ ___to $___",
        "There are ___comparable sales in the subject neighborhoodwithin the past twelvemonths ranging in sale price from$___ to $____"
    ];
    if (fieldsToCheck.includes(field) && (!text || String(text).trim() === '')) {
        return { isError: true, message: `'${field}' should not be blank.` };
    }
    return null;
};