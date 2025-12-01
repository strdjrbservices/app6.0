export const checkRentProximityToSubject = (field, text, allData, path, saleName) => {
    if (field !== 'Proximity to Subject' || !saleName || !saleName.startsWith('COMPARABLE NO.')) {
        return null;
    }

    const proximityText = String(text || '').trim();
    if (!proximityText) return null;

    const proximityValue = parseFloat(proximityText);
    if (isNaN(proximityValue)) return null;

    if (proximityValue > 1) {
        return { isError: true, message: `For Rent Comparables, Proximity to Subject (${proximityText}) must not be greater than 1.0 mile.` };
    }
    return { isMatch: true };
};