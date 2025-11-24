import React from 'react';
import {  checkAssignmentTypeConsistency, checkSubjectFieldsNotBlank } from './generalValidation';
import { checkContractFieldsMandatory, checkFinancialAssistanceInconsistency, checkContractAnalysisConsistency, checkYesNoOnly } from './contractValidation';
import { checkTaxYear, checkRETaxes, checkSpecialAssessments, checkPUD, checkHOA, checkOfferedForSale, checkAnsi } from './subjectValidation';
import { checkZoning, checkZoningDescription, checkSpecificZoningClassification, checkHighestAndBestUse, checkFemaInconsistency, checkFemaFieldsConsistency, checkSiteSectionBlank, checkArea, checkYesNoWithComment, checkUtilities } from './siteValidation';
import { checkHousingPriceAndAge, checkNeighborhoodUsageConsistency, checkSingleChoiceFields, checkNeighborhoodBoundaries, checkNeighborhoodFieldsNotBlank } from './neighborhoodValidation';
import { checkUnits, checkAccessoryUnit, checkNumberOfStories, checkPropertyType, checkConstructionStatusAndReconciliation, checkDesignStyle, checkYearBuilt, checkEffectiveAge, checkAdditionalFeatures, checkPropertyConditionDescription, checkPhysicalDeficienciesImprovements, checkNeighborhoodConformity, checkFoundationType, checkBasementDetails, checkEvidenceOf, checkMaterialCondition, checkHeatingFuel, checkCarStorage, checkImprovementsFieldsNotBlank } from './improvementsValidation';
import { checkConditionAdjustment, checkBedroomsAdjustment, checkBathsAdjustment, checkQualityOfConstructionAdjustment, checkProximityToSubject, checkSiteAdjustment, checkGrossLivingAreaAdjustment, checkSubjectAddressInconsistency, checkDesignStyleAdjustment, checkFunctionalUtilityAdjustment, checkEnergyEfficientItemsAdjustment, checkPorchPatioDeckAdjustment, checkHeatingCoolingAdjustment, checkDataSourceDOM, checkActualAgeAdjustment, checkLeaseholdFeeSimpleConsistency, checkDateOfSale, checkLocationConsistency, checkSalePrice } from './salesComparisonValidation';
import { checkFinalValueConsistency, checkCostApproachDeveloped, checkAppraisalCondition, checkAsOfDate, checkFinalValueBracketing, checkReconciliationFieldsNotBlank } from './reconciliationValidation';
import { checkLenderAddressInconsistency, checkLenderNameInconsistency, checkAppraiserFieldsNotBlank } from './appraiserLenderValidation';
import { checkCostNew, checkSourceOfCostData, checkIndicatedValueByCostApproach, checkCostApproachFieldsNotBlank } from './costApproachValidation';
import { checkResearchHistory, checkSubjectPriorSales, checkComparablePriorSales, checkDataSourceNotBlank, checkEffectiveDateIsCurrentYear, checkSubjectPriorSaleDate, checkCompPriorSaleDate } from './salesHistoryValidation';
import { checkStateRequirements } from './stateValidation';
import { checkIncomeApproachFieldsNotBlank } from './incomeApproachValidation';
import { checkPudInformationFieldsNotBlank } from './pudInformationValidation';
import { checkMarketConditionsFieldsNotBlank } from './marketConditionsValidation';
import { checkProjectInfoFieldsNotBlank } from './form1073Validation';
import { checkProjectAnalysisFieldsNotBlank } from './projectAnalysisValidation';
import { checkUnitDescriptionsFieldsNotBlank } from './unitDescriptionsValidation';
import { checkProjectSiteFieldsNotBlank } from './projectSiteValidation';
import { checkPriorSaleHistoryFieldsNotBlank } from './priorSaleHistoryValidation';
import { checkInfoOfSalesFieldsNotBlank } from './infoOfSalesValidation';
import { Tooltip, Box, LinearProgress, Paper, Typography, IconButton } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';


const HighlightKeywords = ({ text, keywords }) => {
  if (!keywords || !text) {
    return text;
  }
  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{ backgroundColor: '#91ff00ff', color: '#000000', padding: '1px 3px', borderRadius: '3px' }}>{part}</span>
        ) : (
          part
        )
      )}
    </span>
  );
};

export const EditableField = ({ fieldPath, value, onDataChange, editingField, setEditingField, usePre, isMissing, inputClassName, inputStyle, isEditable, isAdjustment, allData, saleName, manualValidations, handleManualValidation }) => {
  const isEditing = isEditable && editingField && JSON.stringify(editingField) === JSON.stringify(fieldPath);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !usePre) {
      setEditingField(null);
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  const handleContainerClick = () => {
    if (!isEditing && isEditable) {
      setEditingField(fieldPath);
    }
  };

  const validationRegistry = {
    // Site Validations
    'Zoning Compliance': [checkZoning],
    'Zoning Description': [checkZoningDescription],
    'Specific Zoning Classification': [checkSpecificZoningClassification],
    'Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?': [checkHighestAndBestUse],
    'FEMA Special Flood Hazard Area': [checkFemaInconsistency, checkFemaFieldsConsistency],
    'FEMA Flood Zone': [checkFemaInconsistency, checkFemaFieldsConsistency],
    'FEMA Map #': [checkFemaFieldsConsistency],
    'FEMA Map Date': [checkFemaFieldsConsistency],
    'Dimensions': [checkSiteSectionBlank],
    'Shape': [checkSiteSectionBlank], 
    'View': [checkSiteSectionBlank], 
    'Area': [checkArea],
    'Are the utilities and off-site improvements typical for the market area? If No, describe': [(field, text, data) => checkYesNoWithComment(field, text, data, { name: 'Are the utilities and off-site improvements typical for the market area? If No, describe', wantedValue: 'yes', unwantedValue: 'no' })],
    'Are there any adverse site conditions or external factors (easements, encroachments, environmental conditions, land uses, etc.)? If Yes, describe': [(field, text, data) => checkYesNoWithComment(field, text, data, { name: 'Are there any adverse site conditions or external factors (easements, encroachments, environmental conditions, land uses, etc.)? If Yes, describe', wantedValue: 'no', unwantedValue: 'yes' })],
    "Electricity": [checkUtilities], "Gas": [checkUtilities], "Water": [checkUtilities], "Sanitary Sewer": [checkUtilities], "Street": [checkUtilities], "Alley": [checkUtilities],

    // Subject Validations
    'Tax Year': [checkTaxYear], 
    'R.E. Taxes $': [checkRETaxes],
    'Special Assessments $': [checkSpecialAssessments],
    'PUD': [checkPUD, checkHOA],
    'HOA $': [checkHOA],
    'Offered for Sale in Last 12 Months': [checkOfferedForSale],
    'ANSI': [checkAnsi],
    'State': [checkStateRequirements],
    'Property Address': [checkSubjectFieldsNotBlank, checkSubjectAddressInconsistency],
    'County': [checkSubjectFieldsNotBlank],
    'Borrower': [checkSubjectFieldsNotBlank],
    'Owner of Public Record': [checkSubjectFieldsNotBlank],
    'Legal Description': [checkSubjectFieldsNotBlank],
    "Assessor's Parcel #": [checkSubjectFieldsNotBlank],
    'Neighborhood Name': [checkSubjectFieldsNotBlank],
    'Map Reference': [checkSubjectFieldsNotBlank],
    'Census Tract': [checkSubjectFieldsNotBlank],
    'Occupant': [checkSubjectFieldsNotBlank],
    'Property Rights Appraised': [checkSubjectFieldsNotBlank],
    'Lender/Client': [checkSubjectFieldsNotBlank, checkLenderNameInconsistency],
    'Address (Lender/Client)': [checkSubjectFieldsNotBlank, checkLenderAddressInconsistency],

    // Neighborhood Validations
    'one unit housing price(high,low,pred)': [checkHousingPriceAndAge, checkNeighborhoodFieldsNotBlank],
    'one unit housing age(high,low,pred)': [checkHousingPriceAndAge, checkNeighborhoodFieldsNotBlank],
    "One-Unit": [checkNeighborhoodUsageConsistency, checkNeighborhoodFieldsNotBlank], 
    "2-4 Unit": [checkNeighborhoodUsageConsistency, checkNeighborhoodFieldsNotBlank], 
    "Multi-Family": [checkNeighborhoodUsageConsistency, checkNeighborhoodFieldsNotBlank], 
    "Commercial": [checkNeighborhoodUsageConsistency, checkNeighborhoodFieldsNotBlank], 
    "Other": [checkNeighborhoodUsageConsistency, checkNeighborhoodFieldsNotBlank],
    "Neighborhood Boundaries": [checkNeighborhoodBoundaries, checkNeighborhoodFieldsNotBlank],
    "Built-Up": [checkSingleChoiceFields, checkNeighborhoodFieldsNotBlank], "Growth": [checkSingleChoiceFields, checkNeighborhoodFieldsNotBlank], "Property Values": [checkSingleChoiceFields, checkNeighborhoodFieldsNotBlank], "Demand/Supply": [checkSingleChoiceFields, checkNeighborhoodFieldsNotBlank], "Marketing Time": [checkSingleChoiceFields, checkNeighborhoodFieldsNotBlank],
    "Neighborhood Description": [checkNeighborhoodFieldsNotBlank],
    "Market Conditions:": [checkNeighborhoodFieldsNotBlank],

    // Improvements Validations
    'Units': [checkUnits, checkAccessoryUnit],
    '# of Stories': [checkNumberOfStories],
    'Type': [checkPropertyType],
    'Existing/Proposed/Under Const.': [checkConstructionStatusAndReconciliation],
    'Design (Style)': [checkDesignStyle, checkDesignStyleAdjustment],
    'Year Built': [checkYearBuilt],
    'Effective Age (Yrs)': [checkEffectiveAge],
    'Additional features': [checkAdditionalFeatures],
    'Describe the condition of the property': [checkPropertyConditionDescription],
    'Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property? If Yes, describe': [checkPhysicalDeficienciesImprovements],
    'Does the property generally conform to the neighborhood (functional utility, style, condition, use, construction, etc.)? If No, describe': [checkNeighborhoodConformity],
    'Foundation Type': [checkFoundationType],
    'Basement Area sq.ft.': [checkBasementDetails],
    'Basement Finish %': [checkBasementDetails],
    'Infestation': [checkEvidenceOf], 'Dampness': [checkEvidenceOf], 'Settlement': [checkEvidenceOf],
    'Foundation Walls (Material/Condition)': [checkMaterialCondition], 'Exterior Walls (Material/Condition)': [checkMaterialCondition],
    'Roof Surface (Material/Condition)': [checkMaterialCondition], 'Gutters & Downspouts (Material/Condition)': [checkMaterialCondition],
    'Window Type (Material/Condition)': [checkMaterialCondition], 'Floors (Material/Condition)': [checkMaterialCondition],
    'Walls (Material/Condition)': [checkMaterialCondition], 
    'Trim/Finish (Material/Condition)': [checkMaterialCondition],
    'Bath Floor (Material/Condition)': [checkMaterialCondition], 'Bath Wainscot (Material/Condition)': [checkMaterialCondition],
    'Fuel': [checkHeatingFuel, checkImprovementsFieldsNotBlank],
    'Car Storage': [checkCarStorage, checkImprovementsFieldsNotBlank],
    'Attic': [checkImprovementsFieldsNotBlank],
    'Heating Type': [checkImprovementsFieldsNotBlank],
    'Cooling Type': [checkImprovementsFieldsNotBlank],
    'Fireplace(s) #': [checkImprovementsFieldsNotBlank],
    'Patio/Deck': [checkImprovementsFieldsNotBlank],
    'Pool': [checkImprovementsFieldsNotBlank],
    'Woodstove(s) #': [checkImprovementsFieldsNotBlank],
    'Fence': [checkImprovementsFieldsNotBlank],
    'Porch': [checkImprovementsFieldsNotBlank],
    'Other Amenities': [checkImprovementsFieldsNotBlank],
    'Appliances': [checkImprovementsFieldsNotBlank],

    // Sales Comparison Validations
    'Address': [checkSubjectAddressInconsistency],
    'Condition': [checkConditionAdjustment], 'Condition Adjustment': [checkConditionAdjustment],
    'Bedrooms': [checkBedroomsAdjustment], 'Bedrooms Adjustment': [checkBedroomsAdjustment],
    'Baths': [checkBathsAdjustment], 'Baths Adjustment': [checkBathsAdjustment],
    'Quality of Construction': [checkQualityOfConstructionAdjustment], 'Quality of Construction Adjustment': [checkQualityOfConstructionAdjustment],
    'Proximity to Subject': [checkProximityToSubject],
    'Site': [checkSiteAdjustment], 'Site Adjustment': [checkSiteAdjustment],
    'Gross Living Area': [checkGrossLivingAreaAdjustment], 'Gross Living Area Adjustment': [checkGrossLivingAreaAdjustment],
    'Design (Style) Adjustment': [checkDesignStyleAdjustment],
    'Functional Utility': [checkFunctionalUtilityAdjustment], 'Functional Utility Adjustment': [checkFunctionalUtilityAdjustment],
    'Energy Efficient Items': [checkEnergyEfficientItemsAdjustment], 'Energy Efficient Items Adjustment': [checkEnergyEfficientItemsAdjustment],
    'Porch/Patio/Deck': [checkPorchPatioDeckAdjustment], 'Porch/Patio/Deck Adjustment': [checkPorchPatioDeckAdjustment],
    'Heating/Cooling': [checkHeatingCoolingAdjustment], 'Heating/Cooling Adjustment': [checkHeatingCoolingAdjustment],
    'Data Source(s)': [checkDataSourceDOM],
    'Actual Age': [checkActualAgeAdjustment], 'Actual Age Adjustment': [checkActualAgeAdjustment],
    'Sale Price': [checkSalePrice],
    'Leasehold/Fee Simple': [checkLeaseholdFeeSimpleConsistency],
    'Date of Sale/Time': [checkDateOfSale],
    'Location': [checkLocationConsistency],

    // Reconciliation Validations
    'Indicated Value by Sales Comparison Approach $': [checkFinalValueConsistency],
    'Indicated Value by: Sales Comparison Approach $': [checkFinalValueConsistency, checkCostApproachDeveloped],
    'opinion of the market value, as defined, of the real property that is the subject of this report is $': [checkFinalValueConsistency],
    'APPRAISED VALUE OF SUBJECT PROPERTY $': [checkFinalValueConsistency],
    'Cost Approach (if developed)': [checkCostApproachDeveloped],
    'This appraisal is made "as is", subject to completion per plans and specifications on the basis of a hypothetical condition that the improvements have been completed, subject to the following repairs or alterations on the basis of a hypothetical condition that the repairs or alterations have been completed, or subject to the following required inspection based on the extraordinary assumption that the condition or deficiency does not require alteration or repair:': [checkAppraisalCondition],
    'as of': [checkAsOfDate],

    'final value': [checkFinalValueBracketing, checkReconciliationFieldsNotBlank],
    // Appraiser/Lender Validations
    'Lender/Client Company Address': [checkLenderAddressInconsistency],

    // General Validations
    'Assignment Type': [checkAssignmentTypeConsistency],

    // Contract Validations
    "I did did not analyze the contract for sale for the subject purchase transaction. Explain the results of the analysis of the contract for sale or why the analysis was not performed.": [checkContractFieldsMandatory, checkContractAnalysisConsistency],
    "Contract Price $": [checkContractFieldsMandatory, checkContractAnalysisConsistency], 
    "Date of Contract": [checkContractFieldsMandatory, checkContractAnalysisConsistency], 
    "Is property seller owner of public record?": [
        checkContractAnalysisConsistency,
        (field, text, data) => checkYesNoOnly(field, text, data, {
        name: 'Is property seller owner of public record?'
    })], 
    // "Data Source(s)": [checkContractAnalysisConsistency],
    "Data Source(s) (Contract)": [checkContractFieldsMandatory, checkContractAnalysisConsistency], 
    "Is there any financial assistance (loan charges, sale concessions, gift or downpayment assistance, etc.) to be paid by any party on behalf of the borrower?": [
        checkContractAnalysisConsistency,
        (field, text, data) => checkYesNoOnly(field, text, data, {
        name: 'Is there any financial assistance (loan charges, sale concessions, gift or downpayment assistance, etc.) to be paid by any party on behalf of the borrower?'
    }), 
    checkFinancialAssistanceInconsistency],
    "If Yes, report the total dollar amount and describe the items to be paid": [checkFinancialAssistanceInconsistency, checkContractAnalysisConsistency],
  };

  validationRegistry['final value'] = [checkFinalValueConsistency, checkFinalValueBracketing];
  // Appraiser Validations
  const appraiserFieldsToValidate = [
    "Signature", "Name", "Company Name", "Company Address", "Telephone Number",
    "Email Address", "Date of Signature and Report", "Effective Date of Appraisal",
    "State Certification #", "or State License #", "or Other (describe)", "State #",
    "State", "Expiration Date of Certification or License", "ADDRESS OF PROPERTY APPRAISED",
    "APPRAISED VALUE OF SUBJECT PROPERTY $", "LENDER/CLIENT Name", "Lender/Client Company Name",
    "Lender/Client Company Address", "Lender/Client Email Address"
  ];

  appraiserFieldsToValidate.forEach(field => {
    if (!validationRegistry[field]) {
      validationRegistry[field] = [];
    }
    validationRegistry[field].push(checkAppraiserFieldsNotBlank);
  });

  validationRegistry['Lender/Client Company Address'].push(checkLenderAddressInconsistency);
  validationRegistry['LENDER/CLIENT Name'].push(checkLenderNameInconsistency);

  // Cost Approach Validations
  validationRegistry["ESTIMATED/REPRODUCTION / REPLACEMENT COST NEW"] = [checkCostNew];
  validationRegistry["Source of cost data"] = [checkSourceOfCostData];
  validationRegistry["Indicated Value By Cost Approach......................................................=$"] = [checkIndicatedValueByCostApproach];

  const costApproachFieldsToValidate = [
    "Estimated", "Source of cost data", "Quality rating from cost service ",
    "Effective date of cost data ", "Comments on Cost Approach (gross living area calculations, depreciation, etc.) ",
    "OPINION OF SITE VALUE = $ ................................................", "Dwelling", "Garage/Carport ",
    " Total Estimate of Cost-New  = $ ...................", "Depreciation ",
    "Depreciated Cost of Improvements......................................................=$ ",
    "“As-is” Value of Site Improvements......................................................=$",
    "Indicated Value By Cost Approach......................................................=$"
  ];
  costApproachFieldsToValidate.forEach(field => {
    if (!validationRegistry[field]) {
      validationRegistry[field] = [];
    }
    validationRegistry[field].push(checkCostApproachFieldsNotBlank);
  });


  validationRegistry["I did did not research the sale or transfer history of the subject property and comparable sales. If not, explain"] = [checkResearchHistory];
  validationRegistry["My research did did not reveal any prior sales or transfers of the subject property for the three years prior to the effective date of this appraisal."] = [checkSubjectPriorSales];
  validationRegistry["My research did did not reveal any prior sales or transfers of the comparable sales for the year prior to the date of sale of the comparable sale."] = [checkComparablePriorSales];
  validationRegistry["Data Source(s) for subject property research"] = [checkDataSourceNotBlank];
  validationRegistry["Data Source(s) for comparable sales research"] = [checkDataSourceNotBlank];
  validationRegistry["Summary of Sales Comparison Approach"] = [checkDataSourceNotBlank];
  validationRegistry["Effective Date of Data Source(s) for prior sale"] = [checkEffectiveDateIsCurrentYear];
  validationRegistry["Date of Prior Sale/Transfer"] = [checkSubjectPriorSaleDate, checkCompPriorSaleDate];

  const incomeApproachFieldsToValidate = [
    "Estimated Monthly Market Rent $", "X Gross Rent Multiplier  = $",
    "Indicated Value by Income Approach", "Summary of Income Approach (including support for market rent and GRM) "
  ];
  incomeApproachFieldsToValidate.forEach(field => {
    if (!validationRegistry[field]) validationRegistry[field] = [];
    validationRegistry[field].push(checkIncomeApproachFieldsNotBlank);
  });

  const pudInformationFieldsToValidate = [
    "PUD Fees $", "PUD Fees (per month)", "PUD Fees (per year)",
    "Is the developer/builder in control of the Homeowners' Association (HOA)?", "Unit type(s)",
    "Provide the following information for PUDs ONLY if the developer/builder is in control of the HOA and the subject property is an attached dwelling unit.",
    "Legal Name of Project", "Total number of phases", "Total number of units",
    "Total number of units sold", "Total number of units rented", "Total number of units for sale",
    "Data source(s)", "Was the project created by the conversion of existing building(s) into a PUD?",
    " If Yes, date of conversion", "Does the project contain any multi-dwelling units? Yes No Data",
    "Are the units, common elements, and recreation facilities complete?", "If No, describe the status of completion.",
    "Are the common elements leased to or by the Homeowners' Association?",
    "If Yes, describe the rental terms and options.", "Describe common elements and recreational facilities."
  ];
  pudInformationFieldsToValidate.forEach(field => {
    if (!validationRegistry[field]) validationRegistry[field] = [];
    validationRegistry[field].push(checkPudInformationFieldsNotBlank);
  });

  const marketConditionsFieldsToValidate = [
    "Instructions:", "Seller-(developer, builder, etc.)paid financial assistance prevalent?",
    "Explain in detail the seller concessions trends for the past 12 months (e.g., seller contributions increased from 3% to 5%, increasing use of buydowns, closing costs, condo fees, options, etc.).",
    "Are foreclosure sales (REO sales) a factor in the market?", "If yes, explain (including the trends in listings and sales of foreclosed properties).",
    "Cite data sources for above information.", "Summarize the above information as support for your conclusions in the Neighborhood section of the appraisal report form. If you used any additional information, such as an analysis of pending sales and/or expired and withdrawn listings, to formulate your conclusions, provide both an explanation and support for your conclusions."
  ];
  marketConditionsFieldsToValidate.forEach(field => {
    if (!validationRegistry[field]) validationRegistry[field] = [];
    validationRegistry[field].push(checkMarketConditionsFieldsNotBlank);
  });

  const projectInfoFieldsToValidate = [
    "Data source(s) for project information", "Project Description", "# of Stories",
    "# of Elevators", "Existing/Proposed/Under Construction", "Year Built",
    "Effective Age", "Exterior Walls",
    "Roof Surface", "Total # Parking", "Ratio (spaces/units)", "Type", "Guest Parking", "# of Units", "# of Units Completed",
    "# of Units For Sale", "# of Units Sold", "# of Units Rented", "# of Owner Occupied Units",
    "# of Phases", "# of Planned Phases",
    "Project Primary Occupancy", "Is the developer/builder in control of the Homeowners' Association (HOA)?",
    "Management Group", "Does any single entity (the same individual, investor group, corporation, etc.) own more than 10% of the total units in the project?"
    , "Was the project created by the conversion of existing building(s) into a condominium?",
    "If Yes,describe the original use and date of conversion",
    "Are the units, common elements, and recreation facilities complete (including any planned rehabilitation for a condominium conversion)?", "If No, describe",
    "Is there any commercial space in the project?",
    "If Yes, describe and indicate the overall percentage of the commercial space.", "Describe the condition of the project and quality of construction.",
    "Describe the common elements and recreational facilities.", "Are any common elements leased to or by the Homeowners' Association?",
    "If Yes, describe the rental terms and options.", "Is the project subject to a ground rent?",
    "If Yes, $ per year (describe terms and conditions)",
    "Are the parking facilities adequate for the project size and type?", "If No, describe and comment on the effect on value and marketability."
  ];
  projectInfoFieldsToValidate.forEach(field => {
    if (!validationRegistry[field]) validationRegistry[field] = [];
    validationRegistry[field].push(checkProjectInfoFieldsNotBlank);
  });

  const projectAnalysisFieldsToValidate = [
    "I did did not analyze the condominium project budget for the current year. Explain the results of the analysis of the budget (adequacy of fees, reserves, etc.), or why the analysis was not performed.",
    "Are there any other fees (other than regular HOA charges) for the use of the project facilities?",
    "If Yes, report the charges and describe.",
    "Compared to other competitive projects of similar quality and design, the subject unit charge appears",
    "If High or Low, describe",
    "Are there any special or unusual characteristics of the project (based on the condominium documents, HOA meetings, or other information) known to the appraiser?",
    "If Yes, describe and explain the effect on value and marketability."
  ];
  projectAnalysisFieldsToValidate.forEach(field => {
    if (!validationRegistry[field]) validationRegistry[field] = [];
    validationRegistry[field].push(checkProjectAnalysisFieldsNotBlank);
  });

  const unitDescriptionsFieldsToValidate = [
    "Unit Charge$",
    "per month X 12 = $",
    "per year",
    "Annual assessment charge per year per square feet of gross living area = $",
    "Utilities included in the unit monthly assessment [None/Heat/Air/Conditioning/Electricity/Gas/Water/Sewer/Cable/Other (describe)]",
    "Floor #",
    "# of Levels",
    "Heating Type/Fuel",
    "Central AC/Individual AC/Other (describe)",
    "Fireplace(s) #/Woodstove(s) #/Deck/Patio/Porch/Balcony/Other",
    "Refrigerator/Range/Oven/Disp Microwave/Dishwasher/Washer/Dryer",
    "Floors", "Walls", "Trim/Finish", "Bath Wainscot", "Doors",
    "None/Garage/Covered/Open", "Assigned/Owned", "# of Cars", "Parking Space #",
    "Finished area above grade contains:",
    "Are the heating and cooling for the individual units separately metered?",
    "Additional features (special energy efficient items, etc.)",
    "Describe the condition of the property (including needed repairs, deterioration, renovations, remodeling, etc.)",
  ];

  unitDescriptionsFieldsToValidate.forEach(field => {
    if (!validationRegistry[field]) {
      validationRegistry[field] = [];
    }
    validationRegistry[field].push(checkUnitDescriptionsFieldsNotBlank);
  });

  const projectSiteFieldsToValidate = [
    "Topography", "Size", "Density", "View", "Specific Zoning Classification", "Zoning Description",
    "Zoning Compliance", "Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?",
    "Electricity", "Gas", "Water", "Sanitary Sewer", "Street", "Alley", "FEMA Special Flood Hazard Area",
    "FEMA Flood Zone", "FEMA Map #", "FEMA Map Date", "Are the utilities and off-site improvements typical for the market area? If No, describe",
    "Are there any adverse site conditions or external factors (easements, encroachments, environmental conditions, land uses, etc.)? If Yes, describe",
  ];
  projectSiteFieldsToValidate.forEach(field => {
    if (!validationRegistry[field]) {
      validationRegistry[field] = [];
    }
    validationRegistry[field].push(checkProjectSiteFieldsNotBlank);
  });

  const priorSaleHistoryFieldsToValidate = [
    "Prior Sale History: I did did not research the sale or transfer history of the subject property and comparable sales",
    "Prior Sale History: My research did did not reveal any prior sales or transfers of the subject property for the three years prior to the effective date of this appraisal",
    "Prior Sale History: Data source(s) for subject",
    "Prior Sale History: My research did did not reveal any prior sales or transfers of the comparable sales for the year prior to the date of sale of the comparable sale",
    "Prior Sale History: Data source(s) for comparables",
    "Prior Sale History: Report the results of the research and analysis of the prior sale or transfer history of the subject property and comparable sales",
    "Prior Sale History: Date of Prior Sale/Transfer",
    "Prior Sale History: Price of Prior Sale/Transfer",
    "Prior Sale History: Data Source(s) for prior sale/transfer",
    "Prior Sale History: Effective Date of Data Source(s)",
    "Prior Sale History: Analysis of prior sale or transfer history of the subject property and comparable sales"
  ];
  priorSaleHistoryFieldsToValidate.forEach(field => {
    if (!validationRegistry[field]) validationRegistry[field] = [];
    validationRegistry[field].push(checkPriorSaleHistoryFieldsNotBlank);
  });

  const infoOfSalesFieldsToValidate = [
    "There are ____ comparable properties currently offered for sale in the subject neighborhood ranging in price from$ ___to $___",
    "There are ___comparable sales in the subject neighborhoodwithin the past twelvemonths ranging in sale price from$___ to $____"
  ];
  infoOfSalesFieldsToValidate.forEach(field => {
    if (!validationRegistry[field]) {
      validationRegistry[field] = [];
    }
    validationRegistry[field].push(checkInfoOfSalesFieldsNotBlank);
  });
  const getValidationInfo = (field, text, data, fieldPath, saleName, manualValidations) => {
    const validationFns = validationRegistry[field] || [];
    let validationResult = null;

    for (const fn of validationFns) {
      // Pass all potential arguments; the function will use what it needs.
      const result = fn(field, text, data, fieldPath, saleName);
      if (result) {
        validationResult = result;
        if (result.isError) break; // Stop on first error
      }
    }
    if (!validationResult && saleName) {
      const salesFns = validationRegistry[field] || [];
      const result = salesFns.map(fn => fn(field, data, saleName)).find(r => r);
      if (result) validationResult = result;
    }

    let style = {};
    let message = validationResult?.message || null;

    const isManuallyValidated = manualValidations && manualValidations[JSON.stringify(fieldPath)];

    if (isManuallyValidated) {
      style = { backgroundColor: '#87ceeb', color: '#000000', padding: '2px 5px', borderRadius: '4px' };
      message = "Manually validated.";
    } else if (validationResult?.isError) {
      style = { backgroundColor: '#ff0015ff', color: '#000000ff', padding: '2px 5px', borderRadius: '4px', border: '1px solid #721c24', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
    } else if (validationResult?.isMatch) {
      style = { backgroundColor: '#91ff00ff', color: '#000000', padding: '2px 5px', borderRadius: '4px' };
      message = validationResult.message || "Validation successful!";
    } else if (field === 'Zoning Compliance' && text?.trim() === 'Legal Nonconforming (Grandfathered Use)') {
      style = { backgroundColor: '#ff9d0bff', color: '#ffffff', padding: '2px 5px', borderRadius: '4px' };
    }

    return { style, message };
  };

  const validation = getValidationInfo(fieldPath.slice(-1)[0], value, allData, fieldPath, saleName, manualValidations);
  const isManuallyValidated = manualValidations && manualValidations[JSON.stringify(fieldPath)];
  const fieldContent = (
    <div className={`editable-field-container ${isAdjustment ? 'adjustment-value' : ''}`} onClick={handleContainerClick} style={{ ...(isMissing ? { border: '2px solid #ff50315b' } : {}), ...validation.style, position: 'relative' }}>
      {isEditing ? (
        React.createElement(usePre ? 'textarea' : 'input', {
          type: "text",
          value: value,
          onChange: (e) => onDataChange(fieldPath, e.target.value),
          onBlur: () => setEditingField(null),
          onKeyDown: handleKeyDown,
          autoFocus: true,
          className: inputClassName || `form-control form-control-sm ${isAdjustment ? 'adjustment-value' : ''}`,
          style: inputStyle || { width: '100%', border: '1px solid #ccc', background: '#fff', padding: 0, height: 'auto', resize: usePre ? 'vertical' : 'none' },
          rows: usePre ? 3 : undefined
        })
      ) : (
        <>
          {(() => {
            if (typeof value === 'object' && value !== null && !React.isValidElement(value)) {
              return JSON.stringify(value);
            }

            const neighborhoodUsageFields = ["One-Unit", "2-4 Unit", "Multi-Family", "Commercial", "Other"];
            if (fieldPath[0] === 'NEIGHBORHOOD' && neighborhoodUsageFields.includes(fieldPath.slice(-1)[0])) {
              const numericValue = String(value || '').replace('%', '').trim();
              return `${numericValue}%`;
            }

            let displayValue = value;
            const finalField = fieldPath.slice(-1)[0];
            if (finalField === 'Report data source(s) used, offering price(s), and date(s)') {
              displayValue = <HighlightKeywords text={value} keywords={['DOM', 'MLS', ' listed for', 'for ', 'Listed on', 'from', 'until', 'RMLS', 'sale on']} />;
            } else if (finalField === 'Neighborhood Boundaries') {
              displayValue = <HighlightKeywords text={value} keywords={['North', 'East', 'West', 'South']} />;
            }

            if (usePre) {
              return <pre className={`editable-field-pre ${isAdjustment ? 'adjustment-value' : ''}`}>{displayValue}</pre>;
            } else {
              return <span className={`editable-field-span ${isAdjustment ? 'adjustment-value' : ''}`}>{displayValue}</span>;
            }
          })()}
        </>
      )}
      {validation.style.backgroundColor === '#ff0015ff' && !isManuallyValidated && handleManualValidation && (
        <IconButton onClick={(e) => { e.stopPropagation(); handleManualValidation(fieldPath); }} size="small" sx={{ padding: '2px', marginLeft: '5px' }}>
          <ThumbUpIcon fontSize="small" />
        </IconButton>
      )}
    </div>
  );

  if (validation.message) {
    return <Tooltip title={validation.message} placement="top" arrow>{fieldContent}</Tooltip>;
  }
  return (
    <div>
      {fieldContent}
    </div>
  );
};

export const FieldTable = ({ id, title, fields, data, cardClass = 'bg-primary', usePre = false, extractionAttempted, onDataChange, editingField, setEditingField, allData }) => {
  return (
    <div id={id} style={{ marginBottom: '1rem', marginTop: '1rem' }} className="card shadow mb-4">
      <div className={`card-header CAR1 ${cardClass} text-white`} style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong style={{ flexGrow: 1, textAlign: 'center' }}>{title}</strong>
      </div>
      <div className="card-body p-0 table-container">
        <table className="table table-hover table-striped mb-0" style={{ fontSize: '0.8rem' }}>
          <tbody>
            {fields.map((field, index) => {

              const fieldLabel = typeof field === 'object' && field !== null ? `${field.choice} ${field.comment || ''}`.trim() : field;
              const value = data[fieldLabel];
              const isMissing = extractionAttempted && (value === undefined || value === null || value === '');
              return (
                <tr key={index}>
                  <td style={{ width: usePre ? '35%' : '50%' }}>
                    {typeof field === 'object' && field !== null ? `${field.choice} ${field.comment || ''}`.trim() : field}
                  </td>
                  <td style={isMissing ? { border: '2px solid red' } : {}}>
                    <EditableField
                      fieldPath={[fieldLabel]}
                      value={value || ''}
                      onDataChange={(path, val) => onDataChange(path[0], val)}
                      editingField={editingField}
                      setEditingField={setEditingField}
                      usePre={usePre} isMissing={isMissing}
                      allData={allData}
                    />
                    {/* Passing manual validation props */}
                    <EditableField manualValidations={allData.manualValidations} handleManualValidation={allData.handleManualValidation} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const MarketConditionsTable = ({ id, title, data, onDataChange, editingField, setEditingField, marketConditionsRows = [], manualValidations, handleManualValidation }) => {
  const timeframes = ["Prior 7-12 Months", "Prior 4-6 Months", "Current-3 Months", "Overall Trend"];

  return (
    <div id={id} style={{ marginBottom: '1rem', marginTop: '1rem' }} className="card shadow mb-4">
      <div className="card-header CAR1 bg-warning text-dark " style={{ marginBottom: "20px", position: 'sticky', top: 0, zIndex: 10, marginTop: '-25px' }}>
        <strong>{title}</strong>
      </div>
      <div className="card-body  table-container">
        <table className="table table-hover table-striped " style={{ fontSize: '0.8rem' }}>
          <thead className="table-light">
            <tr>
              <th className="border border-gray-400 p-1 bg-gray-200" style={{ marginTop: "20px", width: '30%' }}>Inventory Analysis</th>
              {timeframes.map(tf => <th key={tf} className="border border-gray-400 p-1 bg-gray-200">{tf}</th>)}
            </tr>
          </thead>
          <tbody>
            {marketConditionsRows.map(row => (
              <tr key={row.label}>
                <td className="border border-gray-400 p-1 font-medium" style={{ width: '40%' }}>{row.label}</td>
                {timeframes.map(tf => {
                  const fieldName = `${row.fullLabel} (${tf})`;
                  const marketData = data?.MARKET_CONDITIONS ?? {};
                  const value = marketData[fieldName] || '';

                  return (
                    <td key={tf} className="border border-gray-400 p-1">
                      <EditableField
                        fieldPath={[fieldName]}
                        value={value}
                        onDataChange={(path, val) => onDataChange(path, val)}
                        editingField={editingField}
                        setEditingField={setEditingField}
                        isMissing={!value}
                        manualValidations={manualValidations}
                        handleManualValidation={handleManualValidation}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SubjectInfoCard = ({ id, title, fields, data, extractionAttempted, onDataChange, isEditable, editingField, setEditingField, highlightedFields, allData, comparisonData, getComparisonStyle, loading, loadingSection, contractExtracted, setContractExtracted, handleExtract, manualValidations, handleManualValidation }) => {
  const renderGridItem = (field) => {
    const isHighlighted = highlightedFields.includes(field);
    const itemStyle = {};
    if (extractionAttempted && (data[field] === undefined || data[field] === null || data[field] === '')) {
      itemStyle.padding = '4px';
      itemStyle.borderRadius = '4px';
    }

    let displayValue = data[field] || '';
    let fieldPath = [field];

    const comparisonStyle = getComparisonStyle ? getComparisonStyle(field, displayValue, comparisonData?.[field]) : {};



    if (field === 'PUD') {
      const perMonth = data['PUD Fees (per month)'];
      const perYear = data['PUD Fees (per year)'];
      if (perMonth) {
        displayValue = `${displayValue} per month`;
      } else if (perYear) {
        displayValue = `${displayValue} per year`;
      }
    }

    return (
      <div key={field} className={`subject-grid-item ${isHighlighted ? 'highlighted-field' : ''}`} style={{ ...itemStyle, ...comparisonStyle }}>
        <span className="field-label">{field}</span>
        {/* {field === 'Assignment Type' && data[field]?.toLowerCase() === 'purchase transaction' && !contractExtracted && (
          <Tooltip title="Extract Contract Section">
            <IconButton
              onClick={() => {
                handleExtract('CONTRACT');
                if (setContractExtracted) setContractExtracted(true);
              }}
              size="small"
              sx={{ ml: 1, color: 'primary.main' }}
            ><GetAppIcon /></IconButton>
          </Tooltip>
        )} */}
        <EditableField
          fieldPath={fieldPath}
          value={displayValue}
          onDataChange={onDataChange}
          editingField={editingField}
          setEditingField={setEditingField}
          isMissing={extractionAttempted && (data[field] === undefined || data[field] === null || data[field] === '')}
          allData={allData}
          isEditable={isEditable || field === 'Property Address'}
          manualValidations={manualValidations}
          handleManualValidation={handleManualValidation}
        />
      </div>
    );
  };

  return (
    <div id={id} className="card shadow mb-4 subject-info-card">
      <div className="card-header CAR1 bg-secondary text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong>{title}</strong>
      </div>
      {loading && loadingSection === id && (
        <Box sx={{ width: '100%' }}><LinearProgress /></Box>
      )}
      <div className="card-body subject-grid-container">
        {fields
          .filter(field =>
            field !== 'HOA(per month)' &&
            field !== 'HOA(per year)' &&
            field !== 'PUD Fees (per month)' &&
            field !== 'PUD Fees (per year)'
          )
          .map(field => renderGridItem(field))
        }
      </div>
    </div>
  );
};

export const GridInfoCard = ({ id, title, fields, data, cardClass = 'bg-secondary', usePre = false, extractionAttempted, onDataChange, editingField, setEditingField, highlightedFields = [], allData, loading, loadingSection, manualValidations, handleManualValidation }) => {

  const renderNeighborhoodTotal = () => {
    if (id !== 'neighborhood-section' || !data) return null;

    const usageFields = ["One-Unit", "2-4 Unit", "Multi-Family", "Commercial", "Other"];
    const values = usageFields.map(f => {
      const val = String(data[f] || '0').replace('%', '').trim();
      return parseFloat(val) || 0;
    });
    const total = values.reduce((sum, v) => sum + v, 0);

    const totalStyle = {
      fontWeight: 'bold',
      padding: '2px 8px',
      borderRadius: '4px',
      color: total === 100 ? '#000000' : '#721c24',
      backgroundColor: total === 100 ? '#91ff00ff' : '#f8d7da',
    };

    return <span style={totalStyle}>Total: {total}%</span>;
  };

  const cardHeaderColors = {
    'bg-primary': 'primary.main',
    'bg-secondary': 'secondary.main',
    'bg-info': 'info.main',
    'bg-warning': 'warning.main',
    'bg-success': 'success.main',
    'bg-danger': 'error.main',
    'bg-dark': 'grey.900',
  };

  const headerBgColor = cardHeaderColors[cardClass] || 'grey.700';
  const headerColor = cardClass === 'bg-warning' ? 'text.primary' : 'common.white';

  const renderValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      if (value.hasOwnProperty('choice')) {
        return value.choice || '';
      }
      return Object.entries(value).map(([key, val]) => `${key}: ${val}`).join(', ');
    }
    return value || '';
  };

  const renderGridItemValue = (field) => {
    if (field === 'Garage Att./Det./Built-in') {
      const att = data['Garage Att.'] || '';
      const det = data['Garage Detached'] || '';
      const builtin = data['Garage Built-in'] || '';
      return [att, det, builtin].filter(Boolean).join(' / ');
    }
    return renderValue(data[field]);
  };

  const renderGridItem = (field) => {
    if (id === 'neighborhood-section' && field === 'Present Land Use for other') {
      if (!data) return null;
      const otherValue = String(data['Other'] || '0').replace('%', '').trim();
      const otherNumericValue = parseFloat(otherValue);

      if (isNaN(otherNumericValue) || otherNumericValue <= 0) {
        return null; // Don't render if "Other" is 0 or not a positive number
      }
    }

    const isHighlighted = highlightedFields.includes(field);
    let isItemMissing = extractionAttempted && (!data || renderGridItemValue(field) === '');

    if (field === 'Garage Att./Det./Built-in') {
      const att = data['Garage Att.'] || '';
      const det = data['Garage Detached'] || '';
      const builtin = data['Garage Built-in'] || '';
      isItemMissing = extractionAttempted && !att && !det && !builtin;
    }
    return (
      <div key={field} className={`subject-grid-item ${isHighlighted ? 'highlighted-field' : ''}`}>
        <span className="field-label">{field}</span>
        <EditableField
          fieldPath={(() => {
            const baseFieldPath = Array.isArray(field) ? field : [field];

            return onDataChange.length === 2 ? baseFieldPath : [id.replace('-section', '').toUpperCase(), ...baseFieldPath];
          })()}
          value={data ? renderGridItemValue(field) : ''}
          onDataChange={onDataChange}
          editingField={editingField}
          setEditingField={setEditingField}
          usePre={usePre}
          isMissing={isItemMissing}
          inputClassName={`form-control form-control-sm ${usePre ? "field-value-pre" : "field-value"}`}
          isEditable={true}
          allData={allData}
          manualValidations={manualValidations}
          handleManualValidation={handleManualValidation}
          inputStyle={{ width: '100%', border: 'none', background: 'transparent', padding: 0, height: 'auto', resize: usePre ? 'vertical' : 'none' }}
        />
      </div>
    );
  };

  return (
    <Paper id={id} elevation={2} sx={{ mb: 2 }}>
      <Box
        sx={{
          p: 1.5,
          bgcolor: headerBgColor,
          color: headerColor,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Typography variant="h6" component="h5">{title}</Typography>
          {renderNeighborhoodTotal()}
      </Box>
      {loading && loadingSection === id && (
        <Box sx={{ width: '100%' }}><LinearProgress /></Box>
      )}
      <div className="card-body subject-grid-container">
        {fields.map(field => renderGridItem(field))}
      </div>
    </Paper>
  );
};  