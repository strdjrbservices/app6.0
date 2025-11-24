
import { SubjectInfoCard, GridInfoCard, MarketConditionsTable, EditableField } from './FormComponents'; // Assuming EditableField is still needed elsewhere
import { Button, Stack } from '@mui/material';
import { CondoCoopProjectsTable } from './subject';

import SalesComparisonSection from './SalesComparisonSection';
const Form1007 = ({ data, allData, extractionAttempted, handleDataChange, editingField, setEditingField, highlightedSubjectFields, highlightedContractFields, highlightedSiteFields, subjectFields, contractFields, neighborhoodFields, siteFields, improvementsFields, salesGridRows, comparableSales, salesHistoryFields, salesComparisonAdditionalInfoFields, reconciliationFields, costApproachFields, incomeApproachFields, pudInformationFields, marketConditionsRows, marketConditionsFields, appraiserFields, supplementalAddendumFields, uniformResidentialAppraisalReportFields, appraisalAndReportIdentificationFields, imageAnalysisFields, dataConsistencyFields, condoCoopProjectsRows, condoForeclosureFields, comparableRents, RentSchedulesFIELDS2, rentScheduleReconciliationFields, formType, comparisonData, getComparisonStyle, infoOfSalesFields, loading, loadingSection, stateRequirementFields, handleStateRequirementCheck, stateReqLoading, stateReqResponse, stateReqError, handleUnpaidOkCheck, unpaidOkLoading, unpaidOkResponse, unpaidOkError, handleClientRequirementCheck, clientReqLoading, clientReqResponse, clientReqError, handleFhaCheck, fhaLoading, fhaResponse, fhaError, handleEscalationCheck, escalationLoading, escalationResponse, escalationError, manualValidations, handleManualValidation }) => (
  <>
    <Stack direction="row" spacing={2} sx={{ mb: 2, mt: 2 }}>
        <Button variant="contained" onClick={handleStateRequirementCheck} disabled={stateReqLoading} className="blink-me">
            State Req Check
        </Button>
        {/* <Button variant="contained" onClick={handleUnpaidOkCheck} disabled={unpaidOkLoading}>
            Unpaid OK Check
        </Button> */}
        <Button variant="contained" onClick={handleClientRequirementCheck} disabled={clientReqLoading} className="blink-me">
            Client Req Check
        </Button>
        <Button variant="contained" onClick={handleEscalationCheck} disabled={escalationLoading} color="error">
            Escalation Check
        </Button>
        {/* <Button variant="contained" onClick={handleFhaCheck} disabled={fhaLoading}>FHA Check</Button> */}
    </Stack>
    <SubjectInfoCard id="subject-info" title="Subject Information" fields={subjectFields} data={data} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange([field], value)} isEditable={true} editingField={editingField} setEditingField={setEditingField} highlightedFields={highlightedSubjectFields} allData={allData} comparisonData={comparisonData} getComparisonStyle={getComparisonStyle} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />
    <GridInfoCard id="contract-section" title="Contract Section" fields={contractFields} data={data.CONTRACT} cardClass="bg-secondary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['CONTRACT', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} highlightedFields={highlightedContractFields} allData={allData} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />
    <GridInfoCard id="neighborhood-section" title="Neighborhood Section" fields={neighborhoodFields} data={data.NEIGHBORHOOD} cardClass="bg-info" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['NEIGHBORHOOD', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />
    <GridInfoCard id="site-section" title="Site Section" fields={siteFields} data={data} cardClass="bg-warning" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} highlightedFields={highlightedSiteFields} allData={allData} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />
    <GridInfoCard id="improvements-section" title="Improvements Section" fields={improvementsFields} data={data} cardClass="bg-success" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />
    <GridInfoCard id="info-of-sales-section" title="Sales Comparison Approach" fields={infoOfSalesFields} data={data.INFO_OF_SALES} cardClass="bg-primary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['INFO_OF_SALES', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />

    <SalesComparisonSection
      data={data}
      extractionAttempted={extractionAttempted}
      handleDataChange={handleDataChange}
      editingField={editingField}
      setEditingField={setEditingField}
      salesGridRows={salesGridRows}
      comparableSales={comparableSales}
      salesHistoryFields={salesHistoryFields}
      salesComparisonAdditionalInfoFields={salesComparisonAdditionalInfoFields}
      isEditable={true}
      allData={allData}
      formType={formType}
      manualValidations={manualValidations}
      handleManualValidation={handleManualValidation}
    />
    <div id="rent-schedule-section" style={{ marginBottom: '1rem', marginTop: '1rem' }} className="card shadow mb-4">
      <div className="card-header CAR1 bg-info text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong>Comparable Rent Schedule</strong>
      </div>
      <div className="card-body p-0 table-container">
        <table className="table table-hover table-striped mb-0" style={{ fontSize: '0.8rem' }}>
          <thead className="table-light">
            <tr>
              <th className="border border-gray-400 p-1 bg-gray-200">Feature</th>
              <th className="border border-gray-400 p-1 bg-gray-200">Subject</th>
              {comparableRents.map((rent, idx) => (
                <th key={idx} className="border border-gray-400 p-1 bg-gray-200">{rent}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RentSchedulesFIELDS2.map((feature, idx) => (
              <tr key={idx}>
                <td className="border border-gray-400 p-1 font-medium">{feature}</td>
                <td className="border border-gray-400 p-1">
                  <EditableField
                    fieldPath={['Subject', feature]} value={(data.Subject && data.Subject[feature]) || ''}
                    onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField}
                    isMissing={extractionAttempted && (!data.Subject || !data.Subject[feature] || data.Subject[feature] === '')} isEditable={true}
                    manualValidations={manualValidations}
                    handleManualValidation={handleManualValidation}
                     />
                </td>
                {comparableRents.map((rent, cidx) => (
                  <td key={cidx} className="border border-gray-400 p-1">
                    <EditableField
                      fieldPath={[rent, feature]}
                      value={(data[rent] && data[rent][feature]) || ''}
                      onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField}
                      isMissing={extractionAttempted && (!data[rent] || !data[rent][feature] || data[rent][feature] === '')} isEditable={true}
                      manualValidations={manualValidations}
                      handleManualValidation={handleManualValidation}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <GridInfoCard id="rent-schedule-reconciliation-section" title="Comparable Rent Schedule Reconciliation" fields={rentScheduleReconciliationFields} data={data} cardClass="bg-info" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />

    <GridInfoCard id="reconciliation-section" title="RECONCILIATION" fields={reconciliationFields} data={data.RECONCILIATION} cardClass="bg-secondary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['RECONCILIATION', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />
    <GridInfoCard id="cost-approach-section" title="Cost Approach" fields={costApproachFields} data={data} cardClass="bg-dark" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />
    <GridInfoCard id="income-approach-section" title="Income Approach" fields={incomeApproachFields} data={data} cardClass="bg-danger" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />
    <GridInfoCard id="pud-info-section" title="PUD Information" fields={pudInformationFields} data={data} cardClass="bg-secondary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />
    <GridInfoCard id="market-conditions-summary" title="Market Conditions" fields={marketConditionsFields} data={data?.MARKET_CONDITIONS} cardClass="bg-warning" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['MARKET_CONDITIONS', field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />
    <MarketConditionsTable id="market-conditions-section" data={data} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} marketConditionsRows={marketConditionsRows} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />
    <CondoCoopProjectsTable id="condo-coop-section" title="CONDO/CO-OP PROJECTS" data={data} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={true} condoCoopProjectsRows={condoCoopProjectsRows} extractionAttempted={extractionAttempted} />    <GridInfoCard id="condo-foreclosure-section" 
     fields={condoForeclosureFields} data={data.CONDO_FORECLOSURE} cardClass="bg-primary" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['CONDO_FORECLOSURE',...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />
    <GridInfoCard id="appraiser-section" title="CERTIFICATION" fields={appraiserFields} data={data.CERTIFICATION} cardClass="bg-info" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['CERTIFICATION', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} manualValidations={manualValidations} handleManualValidation={handleManualValidation} />
    </>
);

export default Form1007;