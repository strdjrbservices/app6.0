import { checkNotBlank } from './generalValidation';

export const checkLenderAddressInconsistency = (field, data) => {
    const relevantFields = ['Address (Lender/Client)', 'Lender/Client Company Address'];
    if (!relevantFields.includes(field) || !data) return null;

    const subjectLenderAddress = String(data['Address (Lender/Client)'] || '').trim();
    const appraiserLenderAddress = String(data['Lender/Client Company Address'] || '').trim();

    if (subjectLenderAddress && appraiserLenderAddress && subjectLenderAddress !== appraiserLenderAddress) {
        return { isError: true, message: `Lender Address mismatch: Subject section has '${subjectLenderAddress}', but Appraiser section has '${appraiserLenderAddress}'.` };
    }
    return { isMatch: true };
};

export const checkClientNameHtmlConsistency = (field, text, allData) => {
    if (field !== 'LENDER/CLIENT Name') return null;

    const certificationClientName = String(text || '').trim();
    const htmlClientName = String(allData?.comparisonData?.['Client Name'] || '').trim();

    if (htmlClientName && certificationClientName && htmlClientName.toLowerCase() !== certificationClientName.toLowerCase()) {
        return {
            isError: true,
            message: `Client Name mismatch. HTML: '${htmlClientName}', Report: '${certificationClientName}'.`
        };
    }
    return { isMatch: true };
};
export const checkAppraiserFieldsNotBlank = (field, text) => {
    const fieldsToCheck = [
        "Signature",
        "Name",
        "Company Name",
        "Company Address",
        "Telephone Number",
        "Email Address",
        "Date of Signature and Report",
        "Effective Date of Appraisal",
        "State Certification #",
        "or State License #",
        "or Other (describe)",
        "State #",
        "State",
        "Expiration Date of Certification or License",
        "ADDRESS OF PROPERTY APPRAISED",
        "APPRAISED VALUE OF SUBJECT PROPERTY $",
        "LENDER/CLIENT Name",
        "Lender/Client Company Name",
        "Lender/Client Company Address",
        "Lender/Client Email Address"
    ];
    return checkNotBlank(field, text, fieldsToCheck.find(f => f === field));
};

export const checkLenderNameInconsistency = (field, text, data) => {
    if (field !== 'Lender/Client' || !data) return null;
    const subjectLenderName = String(text || '').trim();
    const appraiserLenderName = String(data['Lender/Client Company Name'] || '').trim();
    if (subjectLenderName && appraiserLenderName && subjectLenderName !== appraiserLenderName) {
        return { isError: true, message: `"Lender/Client mismatch: Subject section has '${subjectLenderName}', but Appraiser section has '${appraiserLenderName}'."` };
    }
    return { isMatch: true };
};

export const checkLicenseNumberConsistency = (field, text, data) => {
    if (field !== 'LICENSE/REGISTRATION/CERTIFICATION #') return null;

    const licenseNumber = String(text || '').trim();
    if (!licenseNumber) return null; // Don't validate if blank, other validations handle that.

    const certificationData = data?.CERTIFICATION;
    if (!certificationData) return null;

    const stateCert = String(certificationData['State Certification #'] || '').trim();
    const stateLicense = String(certificationData['or State License #'] || '').trim();
    const otherLicense = String(certificationData['or Other (describe)'] || '').trim();
    const stateNumber = String(certificationData['State #'] || '').trim();

    const possibleMatches = [stateCert, stateLicense, otherLicense, stateNumber].filter(Boolean);

    if (possibleMatches.length > 0 && !possibleMatches.includes(licenseNumber)) {
        return { isError: true, message: `License number mismatch. Expected to match one of: State Certification #, State License #, Other, or State #.` };
    }

    return { isMatch: true };
};

export const checkDateGreaterThanToday = (field, text) => {
    const fieldsToCheck = ['Policy Period To', 'License Vaild To'];
    if (!fieldsToCheck.includes(field)) return null;

    if (!text || String(text).trim() === '') {
        return null; // Don't validate if blank, other validations can handle that.
    }

    const inputDate = new Date(text);
    if (isNaN(inputDate.getTime())) {
        return { isError: true, message: `Invalid date format for '${field}'.` };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight to compare dates only

    if (inputDate <= today) {
        return { isError: true, message: `'${field}' must be a future date.` };
    }

    return { isMatch: true };
};