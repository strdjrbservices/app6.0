import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Subject.css';
import { GlobalStyles, keyframes } from '@mui/system';
import { Info, Warning as WarningIcon, Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon, Close as CloseIcon, CheckCircleOutline as CheckCircleOutlineIcon, ErrorOutline as ErrorOutlineIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import { Button, Stack, List, ListItem, ListItemButton, ListItemText, FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip, Paper, Box, Typography, LinearProgress, Alert, Snackbar, Fade, CircularProgress, ThemeProvider, CssBaseline, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Fab } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import Form1004 from './1004';
import Form1007 from './1007';
import Form1073 from './1073';
import { EditableField, GridInfoCard } from './FormComponents';
import StateRequirementCheck, { STATE_REQUIREMENTS_PROMPT } from './StateRequirementCheck';
import UnpaidOkCheck, { UNPAID_OK_PROMPT } from './UnpaidOkCheck';
import ClientRequirementCheck, { CLIENT_REQUIREMENT_PROMPT } from './ClientRequirementCheck';
import EscalationCheck, { ESCALATION_CHECK_PROMPT } from './EscalationCheck';
import FhaCheck, { FHA_REQUIREMENTS_PROMPT } from './FhaCheck';
import ADUCheck, { ADU_REQUIREMENTS_PROMPT } from './ADUCheck';
import { lightTheme, darkTheme } from '../../theme';

// Import all validation functions
import * as generalValidation from './generalValidation';
import * as contractValidation from './contractValidation';
import * as subjectValidation from './subjectValidation';
import * as siteValidation from './siteValidation';
import * as neighborhoodValidation from './neighborhoodValidation';
import * as improvementsValidation from './improvementsValidation';
import * as salesComparisonValidation from './salesComparisonValidation';
import * as reconciliationValidation from './reconciliationValidation';
import * as appraiserLenderValidation from './appraiserLenderValidation';

import uploadSoundFile from '../../Assets/upload.mp3';
import successSoundFile from '../../Assets/success.mp3';
import errorSoundFile from '../../Assets/error.mp3';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
  60% { transform: translateY(-4px); }
`;


const TooltipStyles = () => (
  <GlobalStyles styles={{
    '.editable-field-container[style*="--tooltip-message"]': {
      position: 'relative',
      cursor: 'pointer',
    },
    '.editable-field-container[style*="--tooltip-message"]:hover::after': {
      content: 'var(--tooltip-message)',
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#864242ff',
      color: 'white',
      padding: '5px 10px',

      borderRadius: '4px',
      fontSize: '0.8rem',
      whiteSpace: 'nowrap',
      zIndex: 1000,
      marginBottom: '5px',
    },
    '.sidebar-link.active': {
      transform: 'scale(1.05)',
      boxShadow: '0 4px 8px rgba(255, 255, 255, 0.2)',
      backgroundColor: '#7587ebff !important',
      color: '#ffffff !important',
      transition: 'transform 0.2s ease-in-out, boxShadow 0.2s ease-in-out',
    },
    '.section-active': {
      backgroundColor: 'rgba(22, 20, 20, 0.2) !important', // Light blue with some transparency
      transition: 'background-color 0.3s ease-in-out',
      borderRadius: '8px',
    }
  }} />
);

const Sidebar = ({ sections, isOpen, isLocked, onLockToggle, onMouseEnter, onMouseLeave, onSectionClick, onThemeToggle, currentTheme, activeSection, loading, loadingSection, extractedSections, visibleSections, onArrowClick }) => (
  <div className={`sidebar ${isOpen ? 'open' : 'closed'}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
    <div className="sidebar-header">
      <img src={process.env.PUBLIC_URL + '/logo.png'} alt="logo" className="sidebar-logo" />
      <h5 className="sidebar-title">DJRB</h5>
      <Tooltip title={isLocked ? "Unpin Sidebar" : "Pin Sidebar"} placement="right">
        <IconButton onClick={onLockToggle} size="small" className="sidebar-toggle-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isLocked ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </IconButton>
      </Tooltip>
      <Tooltip title="Toggle Dark/Light Theme" placement="right">
        <IconButton onClick={onThemeToggle} size="small" sx={{ color: 'var(--primary-color)', ml: 1 }}>
          {currentTheme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>
    </div>
    <List dense>
      {sections.map((section) => (
        <ListItem key={section.id} disablePadding>
          <ListItemButton component="a" href={`#${section.id}`} className={`sidebar-link ${activeSection === section.id ? 'active' : ''}`} onClick={() => onSectionClick(section)} disabled={loading}>
            <ListItemText primary={section.title} />
            {loadingSection === section.id && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <CircularProgress size={16} color="inherit" />
              </Box>
            )}
            {extractedSections.has(section.id) && !visibleSections.has(section.id) && loadingSection !== section.id && (
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onArrowClick(section.id); }} sx={{ rotate: '270deg', animation: `${bounce} 2s infinite`, ml: 'auto' }}>
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            )}
          </ListItemButton>
        </ListItem>
      ))}
    </List>
    <div className="sidebar-footer">
      Appraisal Extractor
    </div>
  </div>
);

const ContractComparisonDialog = ({ open, onClose, onCompare, loading, result, error, selectedFile, contractFile, mainData }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={result ? "md" : "sm"} fullWidth>
      <DialogTitle>
        Contract Comparison
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
        {result ? (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Main Report</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Contract Copy</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {['Contract Price', 'Contract Date'].map(fieldName => {
                  const item = result.find(r => r.field.toLowerCase() === fieldName.toLowerCase());
                  const mainValue = fieldName === 'Contract Price' ? mainData?.CONTRACT?.['Contract Price $'] : mainData?.CONTRACT?.['Date of Contract'];
                  return (
                    <TableRow key={fieldName} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{fieldName}</TableCell>
                      <TableCell>{item?.old_value || mainValue || 'N/A'}</TableCell>
                      <TableCell>{item?.new_value || 'N/A'}</TableCell>
                      <TableCell align="center">
                        {item ? (
                          item.status === 'Match' ? <CheckCircleOutlineIcon color="success" /> : <ErrorOutlineIcon color="error" />
                        ) : <WarningIcon color="warning" />}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : !loading && (
          <Typography>
            Click 'Compare' to check for consistency in Contract Date and Contract Price between the main report and the contract copy.
          </Typography>
        )
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button onClick={onCompare} variant="contained" disabled={loading || !selectedFile || !contractFile}>
          {loading ? <CircularProgress size={24} /> : (result ? 'Reload' : 'Compare')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EngagementLetterDialog = ({ open, onClose, onCompare, loading, result, error, selectedFile, engagementLetterFile, mainData }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={result ? "md" : "sm"} fullWidth>
      <DialogTitle>
        Engagement Letter Comparison
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
        {result ? (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Main Report</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Engagement Letter</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.map((item, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{item.field}</TableCell>
                    <TableCell>{item.main_report_value || 'N/A'}</TableCell>
                    <TableCell>{item.engagement_letter_value || 'N/A'}</TableCell>
                    <TableCell align="center">
                      {item.status === 'Match' ? <CheckCircleOutlineIcon color="success" /> : <ErrorOutlineIcon color="error" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : !loading && (
          <Typography>
            Click 'Compare' to check for consistency in Property Address and Vendor's Fee between the main report and the engagement letter.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        {!result && (
          <Button onClick={onCompare} variant="contained" disabled={loading || !selectedFile || !engagementLetterFile}>Compare</Button>
        )}
        {result && (
          <Button onClick={onCompare} variant="contained" disabled={loading}>Reload</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export const ComparableAddressConsistency = ({ data, comparableSales, extractionAttempted, onDataChange, editingField, setEditingField, isEditable, allData }) => {
  return (
    <div id="comparable-address-consistency-section" style={{}} className="card shadow ">
      <div className="card-header CAR1 bg-dark text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <strong style={{ flexGrow: 1, textAlign: 'center' }}>Comparable Address Consistency Check</strong>
        </div>
      </div>
      <div className="card-body p-0 table-container">
        <table className="table table-hover table-striped mb-0">
          <thead className="table-light">
            <tr>
              <th>Comparable Sale #</th>
              <th>Sales Comparison Approach Address</th>
              <th>Location Map Address</th>
              <th>Photo Section Address</th>
              <th>is label correct?</th>
              <th>duplicate photo?</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {comparableSales.map((sale, index) => {
              const compNum = index + 1;
              const salesGridAddress = data[sale]?.Address || '';
              const locationMapAddress = data[`Location Map Address ${compNum}`] || '';
              const photoAddress = data[`Comparable Photo Address ${compNum}`] || '';
              const matchingPhoto = data[`is label correct? ${compNum}`] || '';
              const duplicatePhoto = data[`duplicate photo? ${compNum}`] || '';

              const getFirstThreeWords = (str) => str.split(/\s+/).slice(0, 3).join(' ').toLowerCase();

              const allAddresses = [salesGridAddress, locationMapAddress, photoAddress];
              const validAddresses = allAddresses.filter(Boolean);

              let isConsistent = false;
              if (validAddresses.length < 2) {
                isConsistent = true;
              } else {
                const shortAddresses = validAddresses.map(getFirstThreeWords);
                const uniqueShortAddresses = new Set(shortAddresses);
                if (uniqueShortAddresses.size < shortAddresses.length) {
                  isConsistent = true;
                }
              }

              const isMissingSalesGrid = extractionAttempted && !salesGridAddress;
              const isMissingLocationMap = extractionAttempted && !locationMapAddress;
              const isMissingPhoto = extractionAttempted && !photoAddress;

              return (
                <tr key={sale}>
                  <td style={{ fontWeight: 'bold' }}>{`Comparable Sale #${compNum}`}</td>
                  <td style={isMissingSalesGrid ? { border: '2px solid red' } : {}}>
                    <EditableField
                      fieldPath={[sale, 'Address']}
                      value={salesGridAddress}
                      onDataChange={onDataChange}
                      editingField={editingField}
                      setEditingField={setEditingField} allData={allData}
                      isMissing={isMissingSalesGrid} isEditable={isEditable}
                    // isEditable={true}
                    />
                  </td>
                  <td style={isMissingLocationMap ? { border: '2px solid red' } : {}}>
                    <EditableField
                      fieldPath={[`Location Map Address ${compNum}`]}
                      value={locationMapAddress}
                      onDataChange={onDataChange}
                      editingField={editingField}
                      setEditingField={setEditingField}
                      isMissing={isMissingLocationMap} allData={allData}
                      isEditable={isEditable}
                    />
                  </td>
                  <td style={isMissingPhoto ? { border: '2px solid red' } : {}}>
                    <EditableField
                      fieldPath={[`Comparable Photo Address ${compNum}`]}
                      value={photoAddress}
                      onDataChange={onDataChange}
                      editingField={editingField}
                      setEditingField={setEditingField}
                      isMissing={isMissingPhoto} allData={allData}
                      isEditable={isEditable}
                    />
                  </td>
                  <td>
                    <EditableField
                      fieldPath={[`is label correct? ${compNum}`]}
                      value={matchingPhoto}
                      onDataChange={onDataChange}
                      editingField={editingField}
                      setEditingField={setEditingField} allData={allData}
                      isEditable={isEditable} />
                  </td>
                  <td>
                    <EditableField
                      fieldPath={[`duplicate photo? ${compNum}`]}
                      value={duplicatePhoto}
                      onDataChange={onDataChange}
                      editingField={editingField}
                      setEditingField={setEditingField} allData={allData}
                      isEditable={isEditable} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {validAddresses.length > 0 && (isConsistent ? <CheckCircleOutlineIcon style={{ color: 'green' }} /> : <ErrorOutlineIcon style={{ color: 'red' }} />)}
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

export const MarketConditionsTable = ({ data, marketConditionsRows, marketConditionsFields, extractionAttempted, onDataChange, editingField, setEditingField, isEditable, allData }) => {
  const timeframes = ["Prior 7-12 Months", "Prior 4-6 Months", "Current-3 Months", "Overall Trend"];

  const getTableValue = (fullLabel, timeframe) => {
    const marketData = data?.MARKET_CONDITIONS ?? {};
    const key = `${fullLabel} (${timeframe})`;
    return marketData[key] ?? marketData[fullLabel] ?? '';
  };

  return (
    <TableContainer component={Paper} sx={{ marginTop: '20px', marginBottom: '20px' }}>
      {/* <div className="card-header CAR1 bg-warning text-dark" style={{ position: 'sticky', top: 0, zIndex: 10 }}><strong>Market Conditions Addendum</strong></div> */}
      <Table className="table mb-20" style={{ marginTop: '20px' }} size="small" aria-label="market-conditions-table">
        <TableHead style={{}}>
          <TableRow>
            <TableCell>Inventory Analysis</TableCell>
            {timeframes.map(tf => <TableCell key={tf} align="center">{tf}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {marketConditionsRows.map(row => (
            <TableRow key={row.label}>
              <TableCell component="th" scope="row">
                {row.label}
              </TableCell>
              {timeframes.map(tf => {
                const value = getTableValue(row.fullLabel, tf) || getTableValue(row.label, tf);
                const style = {};
                if (extractionAttempted && !value) {
                  style.border = '2px solid red';
                }
                return <TableCell key={tf} align="center" style={style}>{value}</TableCell>
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box sx={{ p: 2 }}>
        {marketConditionsFields.map(field => {
          // Render only fields that are not part of the table
          if (marketConditionsRows.some(row => row.fullLabel.includes(field) || field.includes(row.fullLabel))) return null;

          return (
            <Box key={field} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {field}
              </Typography>
              <EditableField
                fieldPath={['MARKET_CONDITIONS', field]}
                value={data?.MARKET_CONDITIONS?.[field] || ''}
                onDataChange={onDataChange}
                editingField={editingField}
                setEditingField={setEditingField} allData={allData}
                isEditable={isEditable}
              />
            </Box>
          );
        })}
      </Box>
    </TableContainer>
  );
};

export const CondoCoopProjectsTable = ({ id, title, data, onDataChange, editingField, setEditingField, isEditable, condoCoopProjectsRows, condoCoopProjectsFields, extractionAttempted, allData }) => {
  const timeframes = ["Prior 7–12 Months", "Prior 4–6 Months", "Current – 3 Months", "Overall Trend"];

  const getTableValue = (fullLabel, timeframe) => {
    const projectData = data?.CONDO_COOP_PROJECTS ?? data ?? {};
    const key = `${fullLabel} (${timeframe})`;
    return projectData[key] ?? '';
  };

  return (
    <div id={id} className="card shadow mb-4">
      <div className="card-header CAR1 bg-primary text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong>{title}</strong>
      </div>
      <div className="card-body p-0 table-container">
        <TableContainer component={Paper}>
          <Table size="small" aria-label="condo-coop-projects-table">
            <TableHead>
              <TableRow>
                <TableCell>Subject Project Data</TableCell>
                {timeframes.map(tf => <TableCell key={tf} align="center">{tf}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {condoCoopProjectsRows.map(row => (
                <TableRow key={row.label}>
                  <TableCell component="th" scope="row">{row.label}</TableCell>
                  {timeframes.map(tf => {
                    const fieldName = `${row.fullLabel} (${tf})`;
                    const value = getTableValue(row.fullLabel, tf);
                    const isMissing = extractionAttempted && !value;
                    return (
                      <TableCell key={tf} align="center" style={isMissing ? { border: '2px solid red' } : {}}>
                        <EditableField fieldPath={['CONDO_COOP_PROJECTS', fieldName]} value={value} onDataChange={onDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} isMissing={isMissing} allData={allData} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

const SalesComparisonSection = ({ data, salesGridRows, comparableSales, extractionAttempted, handleDataChange, editingField, setEditingField, formType, comparisonData, getComparisonStyle, isEditable, allData }) => {
  const getSubjectValue = (row) => {
    const subjectData = data.Subject || {}; let value = subjectData[row.valueKey] ?? subjectData[row.subjectValueKey] ?? data[row.subjectValueKey] ?? data[row.valueKey] ?? ''; return value;
  };

  return (
    <div id="sales-comparison" className="card shadow mb-4">
      <div className="card-header CAR1 bg-dark text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>

      </div>
      <div className="card-body p-0 table-container" style={{ overflowX: 'auto' }}>
        <table className="table table-hover table-striped mb-0 sales-comparison-table">
          <thead className="table-light">
            <tr>
              <th style={{ minWidth: '200px' }}>Feature</th>
              <th style={{ minWidth: '200px' }}>Subject</th>
              {comparableSales.map((sale, index) => (
                <th key={sale} style={{ minWidth: '200px' }}>{`Comparable Sale #${index + 1}`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {salesGridRows.flatMap((row, rowIndex) => {
              const rows = [];
              const subjectValue = getSubjectValue(row);

              rows.push(
                <tr key={`${row.label}-${rowIndex}`}>
                  <td style={{ fontWeight: 'bold' }}>{row.label}</td>
                  <td>
                    {row.isAdjustmentOnly ? '' : (
                      <EditableField
                        fieldPath={['Subject', row.subjectValueKey || row.valueKey]}
                        value={subjectValue}
                        onDataChange={handleDataChange}
                        isEditable={isEditable} allData={allData}
                      />
                    )}
                  </td>
                  {comparableSales.map((sale, compIndex) => {
                    const compData = data[sale] || {};
                    const value = compData[row.valueKey] || '';
                    const isMissing = extractionAttempted && !value && !row.isAdjustmentOnly;
                    return (
                      <td key={`${sale}-${row.label}`} style={isMissing ? { border: '2px solid red' } : {}}>
                        {row.isAdjustmentOnly ? '' : (
                          <EditableField
                            fieldPath={[sale, row.valueKey]}
                            value={value}
                            onDataChange={handleDataChange}
                            editingField={editingField}
                            setEditingField={setEditingField}
                            isEditable={isEditable} allData={allData} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );

              if (row.adjustmentKey) {
                rows.push(
                  <tr key={`${row.label}-adj-${rowIndex}`} className="adjustment-row">
                    <td style={{ paddingLeft: '2rem' }}>
                      <i>Adjustment</i>
                    </td>
                    <td>
                      {/* Subject adjustment if any - usually none */}
                    </td>
                    {comparableSales.map((sale, compIndex) => {
                      const compData = data[sale] || {};
                      const adjValue = compData[row.adjustmentKey] || '';
                      const isMissing = extractionAttempted && !adjValue;
                      return (
                        <td key={`${sale}-${row.adjustmentKey}`} style={isMissing ? { border: '2px solid red' } : {}}>
                          <EditableField
                            fieldPath={[sale, row.adjustmentKey]}
                            value={adjValue}
                            onDataChange={handleDataChange}
                            editingField={editingField}
                            setEditingField={setEditingField}
                            isEditable={isEditable}
                            allData={allData} />
                        </td>
                      );
                    })}
                  </tr>
                );
              }

              return rows;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const PromptAnalysis = ({ onPromptSubmit, loading, response, error, submittedPrompt }) => {
  // const [prompt, setPrompt] = useState('');


  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (prompt.trim()) {
  //     onPromptSubmit(prompt);
  //   }
  // };
  const prompt1 =
    "Verify that the Subject Property Address is identical across all locations in the report including: Subject Section, Sales Comparison Grid, Location Map, Aerial Map, Header/Footer, and any Addenda.\nAlso confirm the presence of the Subject Street View, Front View, and Rear View photos with no duplicates or mislabeled subject photos.";

  const prompt2 =
    "1. Compare bedroom and bathroom counts across the Improvements/Property Characteristics section, Sales Comparison Grid, Sketch/Floor Plan, and all interior/exterior photos.\n2. Verify that Gross Living Area (GLA) is consistent between the Sketch, Improvements section, Sales Grid, Cost Approach (if present), and Addendum comments. Flag any mismatch.";

  const prompt4 =
    "Match all Comparable Sale addresses across the Sales Grid, Comparable Photo Pages, MLS/Map Exhibits, Location Map, and Aerial Map. Confirm that no comparable photos are duplicated, mislabeled, or incorrectly associated with the wrong comparable.";

  const prompt5 =
    "Verify that every photo is properly labeled (Subject, Comp 1, Comp 2, etc.) and confirm that there are no duplicate photos, reused photos, or mislabeled views across the entire photo section.";

  const prompt6 =
    "Please confirm whether the following revision request is addressed in the file:&#10;&#10;• The lease begin date for Rental Comp #3 is incorrectly shown as 'Owner'. Confirm if corrected.&#10;&#10;If addressed in comments, confirm that the corresponding section was updated in the main form.&#10;&#10;For each revision item, answer only: 'Revised – Corrected', 'Revised – Not Corrected', or 'Not Addressed'. Keep responses short.&#10;&#10;Additional Verification (do NOT treat as revisions):&#10;&#10;• Identify any blank fields or unchecked/incorrect checkboxes throughout the form.&#10;• If assignment type is Refinance → Contract Section must be blank (including checkboxes).&#10;• If Purchase → Contract Section fields and checkboxes must be accurately completed.&#10;• Validate Garage/Carport count and type based on the checkboxes marked.&#10;• Verify Appraised Value matches in all required locations: Page 2 (Sales Grid Conclusion), Summary Section, Addendum (if repeated), and Signature Page.&#10;• Signature Date must be after the Effective/As-of Date.&#10;• Signature Page must include 'Fastapp' in the Company/AMC name.&#10;• Check prior services disclosure, exposure time comment, and confirm no appraiser invoice is included. If present, mark as must-remove.&#10;&#10;Now verify presence of the following sections. Answer only 'Present' or 'Not Present': This Report is One of the Following Types:, Comments on Standards Rule 2-3, Reasonable Exposure Time, Comments on Appraisal and Report Identification.";

  const supplementalAddendumPrompt =
    "1. Confirm presence of the following sections and answer only 'Present' or 'Not Present': SUPPLEMENTAL ADDENDUM, ADDITIONAL COMMENTS, APPRAISER'S CERTIFICATION, SUPERVISORY APPRAISER'S CERTIFICATION, Analysis/Comments, GENERAL INFORMATION ON ANY REQUIRED REPAIRS, UNIFORM APPRAISAL DATASET (UAD) DEFINITIONS ADDENDUM.&#10;&#10;2. Confirm presence of the following sections and answer only 'Present' or 'Not Present': SCOPE OF WORK, INTENDED USE, INTENDED USER, DEFINITION OF MARKET VALUE, STATEMENT OF ASSUMPTIONS AND LIMITING CONDITIONS.";


  const renderResponse = (response) => {
    let data = response;
    if (typeof response === 'string') {
      try {
        const parsed = JSON.parse(response);
        if (typeof parsed === 'object' && parsed !== null) {
          data = parsed;
        }
      } catch (e) {
        // Not a JSON string, treat as plain text
      }
    }

    if (typeof data === 'object' && data !== null) {
      const { summary, comparison_summary, ...otherData } = data.fields || data;
      const hasOtherData = Object.keys(otherData).length > 0 && !(Object.keys(otherData).length === 1 && otherData.raw);
      const hasComparisonSummary = Array.isArray(comparison_summary) && comparison_summary.length > 0;


      return (
        <>
          <Stack spacing={3} sx={{ mt: 3 }}>
            {summary && (
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom component="div" color="primary.main">
                  Summary
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {summary}
                </Typography>
              </Paper>
            )}
            {hasComparisonSummary && (
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom component="div" color="primary.main">
                  Comparison Summary
                </Typography>
                <TableContainer>
                  <Table size="small" aria-label="comparison summary table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Section</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparison_summary.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.status}</TableCell>
                          <TableCell>{item.section}</TableCell>
                          <TableCell>{item.comment}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
            {hasOtherData && (
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom component="div" color="primary.main">
                  Analysis Details
                </Typography>
                <TableContainer>
                  <Table size="small" aria-label="prompt analysis table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.light' }}>Field</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.light' }}>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(otherData).map(([key, value]) => (
                        <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                            {key}
                          </TableCell>
                          <TableCell>
                            {(typeof value === 'object' && value !== null && 'value' in value)
                              ? String(value.value)
                              : (typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Stack>
        </>
      );
    }


    return (
      <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom component="div" color="primary.main">
          Analysis Result
        </Typography>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'inherit', fontFamily: 'monospace' }}>
          {String(data)}
        </pre>
      </Paper>
    );
  };


  return (
    <div id="prompt-analysis-section" className="card shadow mb-4">
      <div className="card-header CAR1 bg-info text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong>Prompt Analysis</strong>
      </div>
      <div className="card-body">
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(prompt1)} disabled={loading}>Verify Subject Address & Photos</Button>
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(prompt2)} disabled={loading}>Compare Room Counts</Button>
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(prompt4)} disabled={loading}>Match Comp Addresses</Button>
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(prompt5)} disabled={loading}>Verify Photo Labels & Duplicates</Button>
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(prompt6)} disabled={loading}>Revision Requests Check</Button>
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(supplementalAddendumPrompt)} disabled={loading}>Page Present Check</Button>
          </Stack>
          {loading && <CircularProgress size={24} />}
        </Stack>

        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

        {response && (
          <Box sx={{ mt: 3 }}>
            {submittedPrompt && <Paper elevation={1} sx={{ p: 2, mb: 3, borderLeft: 4, borderColor: 'secondary.main', bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom component="div" color="text.primary">
                Given Prompt
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', color: 'text.secondary' }}>
                {submittedPrompt}
              </Typography>
            </Paper>}
            {renderResponse(response)}
          </Box>
        )}
      </div>
    </div>
  );
};
const ComparisonDialog = ({ open, onClose, data, onDataChange, pdfFile, htmlFile, setComparisonData }) => {
  // const fields = [
  //   'Client Name', 'Client Address', 'Transaction Type', 'FHA Case Number', 'Borrower (and Co-Borrower)',
  //   'Property Address', 'Property County', 'Property Type', 'Assigned to Vendor(s)', 'AMC Reg. Number',
  //   'Client Name', 'Client Address', 'Transaction Type', 'FHA Case Number',
  //   'Borrower (and Co-Borrower)', 'Property Address', 'Property County',
  //   'Property Type', 'Assigned to Vendor(s)', 'AMC Reg. Number',
  //   'Appraisal Type', 'Unit Number', 'UAD XML Report'
  // ];
  // const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  // const [error, setError] = useState('');

  const handleCompare = React.useCallback(async () => {
    // setLoading(true);
    setResult(null);
    // setError('');

    const formData = new FormData();
    if (pdfFile) formData.append('pdf_file', pdfFile);
    if (htmlFile) formData.append('html_file', htmlFile);

    Object.entries(data.comparisonData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const res = await fetch('https://strdjrbservices2.pythonanywhere.com/api/compare/', { method: 'POST', body: formData });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'PDF-HTML comparison failed.');
      }
      const apiResult = await res.json();
      setComparisonData(prev => ({ ...prev, ...apiResult }));
    } catch (err) {
      // setError(err.message);
    } finally {
      // setLoading(false);
    }
  }, [data.comparisonData, pdfFile, htmlFile, setComparisonData]);

  useEffect(() => {
    if (open && !result) {
      handleCompare();
    }
  }, [open, result, handleCompare]);

  // const handleClose = () => {
  //   setResult(null);
  //   setError('');
  //   setLoading(false);
  //   onClose();
  // };

  // return (
  //   <Dialog open={open} onClose={handleClose} maxWidth={result ? "md" : "sm"} fullWidth>
  //     <DialogTitle>
  //       {result ? 'Comparison Result' : 'Confirm Details for Comparison'}
  //       <IconButton
  //         aria-label="close"
  //         onClick={handleClose}
  //         sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
  //       >
  //         <CloseIcon />
  //       </IconButton>
  //     </DialogTitle>
  //     <DialogContent>
  //       {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
  //       {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
  //       {result && (
  //         <ComparisonResultTable result={result.comparison_results || []} />
  //       )}
  //       {!loading && !result && (
  //         <Stack spacing={2} sx={{ mt: 1 }}>
  //           {fields.map(field => (
  //             <TextField
  //               key={field}
  //               label={field}
  //               fullWidth
  //               variant="outlined"
  //               value={data.comparisonData[field] || ''}
  //               onChange={(e) => onDataChange(field, e.target.value)}
  //             />
  //           ))}
  //         </Stack>
  //       )}
  //     </DialogContent>
  //     <DialogActions>
  //       <Button onClick={handleClose}>Close</Button>
  //       {!result && (
  //         <Button onClick={handleCompare} variant="contained" disabled={loading}>
  //           Compare
  //         </Button>
  //       )}
  //       {result && (
  //         <Button onClick={handleCompare} variant="contained" disabled={loading}>
  //           Reload
  //         </Button>
  //       )}

  //     </DialogActions>
  //   </Dialog>
  // );
};

const ComparisonResultTable = ({ result }) => {
  if (!result || result.length === 0) {
    return <Alert severity="success" sx={{ mt: 2 }}>No differences found.</Alert>;
  }
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table stickyHeader aria-label="comparison results table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Value from HTML</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Value from PDF</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {result.map((item, index) => (
            <TableRow key={index} hover>
              <TableCell>{item.field}</TableCell>
              <TableCell>{item.html_value}</TableCell>
              <TableCell>{item.pdf_value}</TableCell>
              <TableCell align="center">
                {item.status === 'Match' ? (
                  <CheckCircleOutlineIcon color="success" />
                ) : (
                  <ErrorOutlineIcon color="error" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const getComparisonStyle = (field, extractedValue, comparisonValue) => {
  if (!comparisonValue) {
    return {};
  }
  const areDifferent = String(extractedValue).trim() !== String(comparisonValue).trim();
  if (areDifferent) {
    return { border: '1px solid red' };
  }
  return {};
};

const playSound = (soundType) => {
  let soundFile;
  if (soundType === 'success') {
    soundFile = successSoundFile;
  } else if (soundType === 'error') {
    soundFile = errorSoundFile;
  } else if (soundType === 'upload') {
    soundFile = uploadSoundFile;
  } else {
    return;
  }


  try {
    const audio = new Audio(soundFile);
    audio.play().catch(e => console.error("Error playing sound:", e));

  } catch (e) {
    console.error("Error playing sound:", e);
  }
};

function Subject() {
  const [data, setData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false); const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [timer, setTimer] = useState(0);
  const [selectedFormType, setSelectedFormType] = useState('1004');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [extractionAttempted, setExtractionAttempted] = useState(false);
  const [lastExtractionTime, setLastExtractionTime] = useState(null);
  const timerRef = useRef(null);
  const [isEditable, setIsEditable] = useState(true);
  const htmlFileInputRef = useRef(null);
  const contractFileInputRef = useRef(null);
  const engagementLetterFileInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [themeMode, setThemeMode] = useState('light');
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isComparisonDialogOpen, setIsComparisonDialogOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState({
    // This will be populated from HTML extraction

  });
  const [activeSection, setActiveSection] = useState(null);
  const [promptAnalysisLoading, setPromptAnalysisLoading] = useState(false);
  const [promptAnalysisResponse, setPromptAnalysisResponse] = useState(null);
  const [promptAnalysisError, setPromptAnalysisError] = useState('');
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const [fileUploadTimer, setFileUploadTimer] = useState(0);
  const [stateReqLoading, setStateReqLoading] = useState(false);
  const [stateReqResponse, setStateReqResponse] = useState(null);
  const [stateReqError, setStateReqError] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [unpaidOkLoading, setUnpaidOkLoading] = useState(false);
  const [unpaidOkResponse, setUnpaidOkResponse] = useState(null);
  const [unpaidOkError, setUnpaidOkError] = useState('');
  const [clientReqLoading, setClientReqLoading] = useState(false);
  const [clientReqResponse, setClientReqResponse] = useState(null);
  const [clientReqError, setClientReqError] = useState('');
  const [fhaLoading, setFhaLoading] = useState(false);
  const [fhaResponse, setFhaResponse] = useState(null);
  const [fhaError, setFhaError] = useState('');
  const [ADULoading, setADULoading] = useState(false);
  const [ADUResponse, setADUResponse] = useState(null);
  const [ADUError, setADUError] = useState('');
  const [escalationLoading, setEscalationLoading] = useState(false);
  const [escalationResponse, setEscalationResponse] = useState(null);
  const [escalationError, setEscalationError] = useState('');
  const [extractedSections, setExtractedSections] = useState(new Set());
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [htmlFile, setHtmlFile] = useState(null);
  const [contractFile, setContractFile] = useState(null);
  const [engagementLetterFile, setEngagementLetterFile] = useState(null);
  const [loadingSection, setLoadingSection] = useState(null);

  const [manualValidations, setManualValidations] = useState({});

  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [contractExtracted, setContractExtracted] = useState(false);
  const [isContractCompareOpen, setIsContractCompareOpen] = useState(false);
  const [contractCompareLoading, setContractCompareLoading] = useState(false);
  const [contractCompareResult, setContractCompareResult] = useState(null);
  const [contractCompareError, setContractCompareError] = useState('');

  const [isEngagementLetterDialogOpen, setIsEngagementLetterDialogOpen] = useState(false);
  const [engagementLetterCompareLoading, setEngagementLetterCompareLoading] = useState(false);
  const [engagementLetterCompareResult, setEngagementLetterCompareResult] = useState(null);
  const [engagementLetterCompareError, setEngagementLetterCompareError] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);



  const unpaidOkLenders = [
    'PRMG', 'Paramount Residential Mortgage Group',
    'CARDINAL FINANCIAL COMPANY',
    'Ice Lender Holdings LLC',
    'NP Inc', 'NQM Funding, LLC',
    'East Coast Capital',
    'Guaranteed Rate. Inc',
    'Commercial Lender, LLC',
    'LoanDepot.com',
    'Direct Lending Partners',
    'CIVIC',
    'CV3',
    'United Faith Mortgage',
    'Arixa Capital', 'Crosswind Financial', 'Western Alliance Bank',
    'RCN Capital, LLC',
    'Aura Mortgage Advisors, LLC', 'Blue Hub Capital',
    'Nations Direct Mortgage LLC',
    'Sierra Pacific Mortgage Company Inc',
    'Champions Funding LLC'
  ].map(l => l.toLowerCase());

  const isUnpaidOkLender = data['Lender/Client'] && unpaidOkLenders.some(lender => data['Lender/Client'].toLowerCase().includes(lender));

  const buildValidationRegistry = () => {
    const registry = {
      // Site Validations
      'Zoning Compliance': [siteValidation.checkZoning],
      'Zoning Description': [siteValidation.checkZoningDescription],
      'Specific Zoning Classification': [siteValidation.checkSpecificZoningClassification, neighborhoodValidation.checkSpecificZoningClassification],
      'Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?': [siteValidation.checkHighestAndBestUse],
      'FEMA Special Flood Hazard Area': [siteValidation.checkFemaInconsistency, siteValidation.checkFemaFieldsConsistency],
      'FEMA Flood Zone': [siteValidation.checkFemaInconsistency, siteValidation.checkFemaFieldsConsistency],
      'FEMA Map #': [siteValidation.checkFemaFieldsConsistency],
      'FEMA Map Date': [siteValidation.checkFemaFieldsConsistency],
      'Dimensions': [siteValidation.checkSiteSectionBlank],
      'Shape': [siteValidation.checkSiteSectionBlank],
      'View': [siteValidation.checkSiteSectionBlank],
      'Area': [siteValidation.checkArea],
      'Are the utilities and off-site improvements typical for the market area? If No, describe': [(field, text, data) => siteValidation.checkYesNoWithComment(field, text, data, { name: 'Are the utilities and off-site improvements typical for the market area? If No, describe', wantedValue: 'yes', unwantedValue: 'no' })],
      'Are there any adverse site conditions or external factors (easements, encroachments, environmental conditions, land uses, etc.)? If Yes, describe': [(field, text, data) => siteValidation.checkYesNoWithComment(field, text, data, { name: 'Are there any adverse site conditions or external factors (easements, encroachments, environmental conditions, land uses, etc.)? If Yes, describe', wantedValue: 'no', unwantedValue: 'yes' })],
      "Electricity": [siteValidation.checkUtilities], "Gas": [siteValidation.checkUtilities], "Water": [siteValidation.checkUtilities], "Sanitary Sewer": [siteValidation.checkUtilities], "Street": [siteValidation.checkUtilities], "Alley": [siteValidation.checkUtilities],

      // Subject Validations
      'Tax Year': [subjectValidation.checkTaxYear],
      'R.E. Taxes $': [subjectValidation.checkRETaxes],
      'Special Assessments $': [subjectValidation.checkSpecialAssessments],
      'PUD': [subjectValidation.checkPUD, subjectValidation.checkHOA],
      'HOA $': [subjectValidation.checkHOA],
      'Offered for Sale in Last 12 Months': [subjectValidation.checkOfferedForSale],
      'ANSI': [subjectValidation.checkAnsi],
      'Property Address': [generalValidation.checkSubjectFieldsNotBlank, salesComparisonValidation.checkSubjectAddressInconsistency],
      'County': [generalValidation.checkSubjectFieldsNotBlank],
      'Borrower': [generalValidation.checkSubjectFieldsNotBlank],
      'Owner of Public Record': [generalValidation.checkSubjectFieldsNotBlank],
      'Legal Description': [generalValidation.checkSubjectFieldsNotBlank],
      "Assessor's Parcel #": [generalValidation.checkSubjectFieldsNotBlank],
      'Neighborhood Name': [generalValidation.checkSubjectFieldsNotBlank],
      'Map Reference': [generalValidation.checkSubjectFieldsNotBlank],
      'Census Tract': [generalValidation.checkSubjectFieldsNotBlank],
      'Occupant': [generalValidation.checkSubjectFieldsNotBlank],
      'Property Rights Appraised': [generalValidation.checkSubjectFieldsNotBlank],
      'Lender/Client': [generalValidation.checkSubjectFieldsNotBlank, appraiserLenderValidation.checkLenderNameInconsistency],
      'Address (Lender/Client)': [generalValidation.checkSubjectFieldsNotBlank, appraiserLenderValidation.checkLenderAddressInconsistency],

      // Neighborhood Validations
      'one unit housing price(high,low,pred)': [neighborhoodValidation.checkHousingPriceAndAge, neighborhoodValidation.checkNeighborhoodFieldsNotBlank],
      'one unit housing age(high,low,pred)': [neighborhoodValidation.checkHousingPriceAndAge, neighborhoodValidation.checkNeighborhoodFieldsNotBlank],
      "One-Unit": [neighborhoodValidation.checkNeighborhoodUsageConsistency, neighborhoodValidation.checkNeighborhoodFieldsNotBlank],
      "2-4 Unit": [neighborhoodValidation.checkNeighborhoodUsageConsistency, neighborhoodValidation.checkNeighborhoodFieldsNotBlank],
      "Multi-Family": [neighborhoodValidation.checkNeighborhoodUsageConsistency, neighborhoodValidation.checkNeighborhoodFieldsNotBlank],
      "Commercial": [neighborhoodValidation.checkNeighborhoodUsageConsistency, neighborhoodValidation.checkNeighborhoodFieldsNotBlank],
      "Other": [neighborhoodValidation.checkNeighborhoodUsageConsistency, neighborhoodValidation.checkNeighborhoodFieldsNotBlank],
      "Neighborhood Boundaries": [neighborhoodValidation.checkNeighborhoodBoundaries, neighborhoodValidation.checkNeighborhoodFieldsNotBlank],
      "Built-Up": [neighborhoodValidation.checkSingleChoiceFields, neighborhoodValidation.checkNeighborhoodFieldsNotBlank], "Growth": [neighborhoodValidation.checkSingleChoiceFields, neighborhoodValidation.checkNeighborhoodFieldsNotBlank], "Property Values": [neighborhoodValidation.checkSingleChoiceFields, neighborhoodValidation.checkNeighborhoodFieldsNotBlank], "Demand/Supply": [neighborhoodValidation.checkSingleChoiceFields, neighborhoodValidation.checkNeighborhoodFieldsNotBlank], "Marketing Time": [neighborhoodValidation.checkSingleChoiceFields, neighborhoodValidation.checkNeighborhoodFieldsNotBlank],
      "Neighborhood Description": [neighborhoodValidation.checkNeighborhoodFieldsNotBlank],
      "Market Conditions:": [neighborhoodValidation.checkNeighborhoodFieldsNotBlank],

      // Improvements Validations
      'Units': [improvementsValidation.checkUnits, improvementsValidation.checkAccessoryUnit],
      '# of Stories': [improvementsValidation.checkNumberOfStories],
      'Type': [improvementsValidation.checkPropertyType],
      'Existing/Proposed/Under Const.': [improvementsValidation.checkConstructionStatusAndReconciliation],
      'Design (Style)': [improvementsValidation.checkDesignStyle, salesComparisonValidation.checkDesignStyleAdjustment],
      'Year Built': [improvementsValidation.checkYearBuilt],
      'Effective Age (Yrs)': [improvementsValidation.checkEffectiveAge],
      'Additional features': [improvementsValidation.checkAdditionalFeatures],
      'Describe the condition of the property': [improvementsValidation.checkPropertyConditionDescription],
      'Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property? If Yes, describe': [improvementsValidation.checkPhysicalDeficienciesImprovements],
      'Does the property generally conform to the neighborhood (functional utility, style, condition, use, construction, etc.)? If No, describe': [improvementsValidation.checkNeighborhoodConformity],
      'Foundation Type': [improvementsValidation.checkFoundationType],
      'Basement Area sq.ft.': [improvementsValidation.checkBasementDetails],
      'Basement Finish %': [improvementsValidation.checkBasementDetails],
      'Infestation': [improvementsValidation.checkEvidenceOf], 'Dampness': [improvementsValidation.checkEvidenceOf], 'Settlement': [improvementsValidation.checkEvidenceOf],
      'Foundation Walls (Material/Condition)': [improvementsValidation.checkMaterialCondition], 'Exterior Walls (Material/Condition)': [improvementsValidation.checkMaterialCondition],
      'Roof Surface (Material/Condition)': [improvementsValidation.checkMaterialCondition], 'Gutters & Downspouts (Material/Condition)': [improvementsValidation.checkMaterialCondition],
      'Window Type (Material/Condition)': [improvementsValidation.checkMaterialCondition], 'Floors (Material/Condition)': [improvementsValidation.checkMaterialCondition],
      'Walls (Material/Condition)': [improvementsValidation.checkMaterialCondition],
      'Trim/Finish (Material/Condition)': [improvementsValidation.checkMaterialCondition],
      'Bath Floor (Material/Condition)': [improvementsValidation.checkMaterialCondition], 'Bath Wainscot (Material/Condition)': [improvementsValidation.checkMaterialCondition],
      'Fuel': [improvementsValidation.checkHeatingFuel, improvementsValidation.checkImprovementsFieldsNotBlank],
      'Car Storage': [improvementsValidation.checkCarStorage, improvementsValidation.checkImprovementsFieldsNotBlank],

      // Sales Comparison Validations
      'Address': [salesComparisonValidation.checkSubjectAddressInconsistency],
      'Condition': [salesComparisonValidation.checkConditionAdjustment], 'Condition Adjustment': [salesComparisonValidation.checkConditionAdjustment],
      'Bedrooms': [salesComparisonValidation.checkBedroomsAdjustment], 'Bedrooms Adjustment': [salesComparisonValidation.checkBedroomsAdjustment],
      'Baths': [salesComparisonValidation.checkBathsAdjustment], 'Baths Adjustment': [salesComparisonValidation.checkBathsAdjustment],
      'Quality of Construction': [salesComparisonValidation.checkQualityOfConstructionAdjustment], 'Quality of Construction Adjustment': [salesComparisonValidation.checkQualityOfConstructionAdjustment],
      'Proximity to Subject': [salesComparisonValidation.checkProximityToSubject],
      'Site': [salesComparisonValidation.checkSiteAdjustment], 'Site Adjustment': [salesComparisonValidation.checkSiteAdjustment],
      'Gross Living Area': [salesComparisonValidation.checkGrossLivingAreaAdjustment], 'Gross Living Area Adjustment': [salesComparisonValidation.checkGrossLivingAreaAdjustment],
      'Design (Style) Adjustment': [salesComparisonValidation.checkDesignStyleAdjustment],
      'Functional Utility': [salesComparisonValidation.checkFunctionalUtilityAdjustment], 'Functional Utility Adjustment': [salesComparisonValidation.checkFunctionalUtilityAdjustment],
      'Energy Efficient Items': [salesComparisonValidation.checkEnergyEfficientItemsAdjustment], 'Energy Efficient Items Adjustment': [salesComparisonValidation.checkEnergyEfficientItemsAdjustment],
      'Porch/Patio/Deck': [salesComparisonValidation.checkPorchPatioDeckAdjustment], 'Porch/Patio/Deck Adjustment': [salesComparisonValidation.checkPorchPatioDeckAdjustment],
      'Heating/Cooling': [salesComparisonValidation.checkHeatingCoolingAdjustment], 'Heating/Cooling Adjustment': [salesComparisonValidation.checkHeatingCoolingAdjustment],
      'Data Source(s)': [salesComparisonValidation.checkDataSourceDOM],
      'Actual Age': [salesComparisonValidation.checkActualAgeAdjustment], 'Actual Age Adjustment': [salesComparisonValidation.checkActualAgeAdjustment],
      'Sale Price': [salesComparisonValidation.checkSalePrice],
      'Leasehold/Fee Simple': [salesComparisonValidation.checkLeaseholdFeeSimpleConsistency],
      'Date of Sale/Time': [salesComparisonValidation.checkDateOfSale],
      'Location': [salesComparisonValidation.checkLocationConsistency, neighborhoodValidation.checkLocation, neighborhoodValidation.checkNeighborhoodFieldsNotBlank],

      // Reconciliation Validations
      'Indicated Value by Sales Comparison Approach $': [reconciliationValidation.checkFinalValueConsistency],
      'Indicated Value by: Sales Comparison Approach $': [reconciliationValidation.checkFinalValueConsistency, reconciliationValidation.checkCostApproachDeveloped],
      'opinion of the market value, as defined, of the real property that is the subject of this report is $': [reconciliationValidation.checkFinalValueConsistency],
      'APPRAISED VALUE OF SUBJECT PROPERTY $': [reconciliationValidation.checkFinalValueConsistency],
      'Cost Approach (if developed)': [reconciliationValidation.checkCostApproachDeveloped],
      'This appraisal is made "as is", subject to completion per plans and specifications on the basis of a hypothetical condition that the improvements have been completed, subject to the following repairs or alterations on the basis of a hypothetical condition that the repairs or alterations have been completed, or subject to the following required inspection based on the extraordinary assumption that the condition or deficiency does not require alteration or repair:': [reconciliationValidation.checkAppraisalCondition],
      'as of': [reconciliationValidation.checkAsOfDate],
      'final value': [reconciliationValidation.checkFinalValueBracketing, reconciliationValidation.checkReconciliationFieldsNotBlank, reconciliationValidation.checkFinalValueConsistency],

      // General Validations
      'Assignment Type': [generalValidation.checkAssignmentTypeConsistency],

      // Contract Validations
      "I did did not analyze the contract for sale for the subject purchase transaction. Explain the results of the analysis of the contract for sale or why the analysis was not performed.": [contractValidation.checkContractFieldsMandatory, contractValidation.checkContractAnalysisConsistency],
      "Contract Price $": [contractValidation.checkContractFieldsMandatory, contractValidation.checkContractAnalysisConsistency],
      "Date of Contract": [contractValidation.checkContractFieldsMandatory, contractValidation.checkContractAnalysisConsistency],
      "Is property seller owner of public record?": [contractValidation.checkContractAnalysisConsistency, (field, text, data) => contractValidation.checkYesNoOnly(field, text, data, { name: 'Is property seller owner of public record?' })],
      "Data Source(s) (Contract)": [contractValidation.checkContractFieldsMandatory, contractValidation.checkContractAnalysisConsistency],
      "Is there any financial assistance (loan charges, sale concessions, gift or downpayment assistance, etc.) to be paid by any party on behalf of the borrower?": [contractValidation.checkContractAnalysisConsistency, (field, text, data) => contractValidation.checkYesNoOnly(field, text, data, { name: 'Is there any financial assistance (loan charges, sale concessions, gift or downpayment assistance, etc.) to be paid by any party on behalf of the borrower?' }), contractValidation.checkFinancialAssistanceInconsistency],
      "If Yes, report the total dollar amount and describe the items to be paid": [contractValidation.checkFinancialAssistanceInconsistency, contractValidation.checkContractAnalysisConsistency],
    };
    return registry;
  };

  const getValidationErrors = () => {
    const errors = [];
    if (!data || Object.keys(data).length === 0) {
      return errors;
    }

    const validationRegistry = buildValidationRegistry();
    const allData = data;

    const runChecksForField = (sectionName, fieldName, value, path, saleName = null) => {
      const validationFns = validationRegistry[fieldName] || [];
      for (const fn of validationFns) {
        try {
          const result = fn(fieldName, value, allData, path, saleName);
          if (result && result.isError) {
            errors.push([sectionName, `${fieldName}${saleName ? ` (${saleName})` : ''}`, result.message]);
            break; // Stop on first error for this field
          }
        } catch (e) {
          // console.error(`Error validating ${fieldName} in ${sectionName}:`, e);
        }
      }
    };

    // Iterate over all sections and fields in the data
    Object.keys(allData).forEach(sectionKey => {
      const sectionData = allData[sectionKey];
      if (typeof sectionData === 'object' && sectionData !== null) {
        Object.keys(sectionData).forEach(fieldKey => {
          const value = sectionData[fieldKey];
          const path = [sectionKey, fieldKey];
          runChecksForField(sectionKey, fieldKey, value, path);
        });
      } else {
        // For root level fields
        const value = allData[sectionKey];
        const path = [sectionKey];
        runChecksForField('General', sectionKey, value, path);
      }
    });

    // Special handling for Sales Comparison Grid
    comparableSales.forEach(saleName => {
      if (allData[saleName]) {
        Object.keys(allData[saleName]).forEach(fieldKey => {
          const value = allData[saleName][fieldKey];
          const path = [saleName, fieldKey];
          runChecksForField('Sales Comparison', fieldKey, value, path, saleName);
        });
      }
    });

    return errors;
  };

  const handleGenerateErrorLog = () => {
    if (Object.keys(data).length === 0) {
      setNotification({ open: true, message: 'No data to generate an error log.', severity: 'warning' });
      return;
    }

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let yPos = margin;

    const addHeaderFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Error Log Report', margin, 10);
        doc.text(new Date().toLocaleDateString(), doc.internal.pageSize.width - margin, 10, { align: 'right' });
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, pageHeight - 10, { align: 'center' });
      }
    };

    const addSection = (title, head, body) => {
      if (body.length === 0) return;

      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(40);
      doc.text(title, margin, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [head],
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [200, 0, 0], textColor: 255 },
        didDrawPage: (data) => { yPos = data.cursor.y + 10; },
      });
      yPos = doc.lastAutoTable.finalY + 10;
    };

    // 1. Missing Fields
    const missingFields = [];
    if (extractionAttempted) {
      const allFields = [
        ...subjectFields.map(f => ({ section: 'Subject', field: f, path: ['Subject', f] })),
        ...contractFields.map(f => ({ section: 'Contract', field: f, path: ['CONTRACT', f] })),
        ...neighborhoodFields.map(f => ({ section: 'Neighborhood', field: f, path: ['NEIGHBORHOOD', f] })),
        ...siteFields.map(f => ({ section: 'Site', field: f, path: ['SITE', f] })),
        ...improvementsFields.map(f => ({ section: 'Improvements', field: f, path: ['IMPROVEMENTS', f] })),
        ...reconciliationFields.map(f => ({ section: 'Reconciliation', field: f, path: ['RECONCILIATION', f] })),
        ...incomeApproachFields.map(f => ({ section: 'Income Approach', field: f, path: ['INCOME_APPROACH', f] })),
        ...costApproachFields.map(f => ({ section: 'Cost Approach', field: f, path: ['COST_APPROACH', f] })),
        ...pudInformationFields.map(f => ({ section: 'PUD Information', field: f, path: ['PUD_INFO', f] })),
        ...appraiserFields.map(f => ({ section: 'Appraiser/Certification', field: f, path: ['CERTIFICATION', f] })),
        ...marketConditionsFields.map(f => ({ section: 'Market Conditions', field: f, path: ['MARKET_CONDITIONS', f] })),
        ...salesHistoryFields.map(f => ({ section: 'Sales History', field: f, path: ['SALES_HISTORY', f] })),
        ...salesComparisonAdditionalInfoFields.map(f => ({ section: 'Sales Comparison Additional Info', field: f, path: ['SALES_TRANSFER', f] })),
        ...infoOfSalesFields.map(f => ({ section: 'Info of Sales', field: f, path: ['INFO_OF_SALES', f] })),
        ...projectSiteFields.map(f => ({ section: 'Project Site', field: f, path: ['PROJECT_SITE', f] })),
        ...projectInfoFields.map(f => ({ section: 'Project Information', field: f, path: ['PROJECT_INFO', f] })),
        ...projectAnalysisFields.map(f => ({ section: 'Project Analysis', field: f, path: ['PROJECT_ANALYSIS', f] })),
        ...unitDescriptionsFields.map(f => ({ section: 'Unit Descriptions', field: f, path: ['UNIT_DESCRIPTIONS', f] })),
        ...priorSaleHistoryFields.map(f => ({ section: 'Prior Sale History', field: f, path: ['PRIOR_SALE_HISTORY', f] })),
      ];

      allFields.forEach(({ section, field, path }) => {
        let value = data;
        for (const key of path) {
          value = value?.[key];
        }
        if (value === undefined || value === null || value === '') {
          missingFields.push([section, field]);
        }
      });
    }
    addSection('Missing Fields', ['Section', 'Field'], missingFields);

    // 2. Requirement Check Errors
    const requirementErrors = [];
    const checks = [
      { name: 'Client Requirements', response: clientReqResponse },
      { name: 'State Requirements', response: stateReqResponse },
      { name: 'FHA Requirements', response: fhaResponse },
      { name: 'ADU Requirements', response: ADUResponse },
      { name: 'Escalation Points', response: escalationResponse },
    ];

    checks.forEach(check => {
      if (check.response && Array.isArray(check.response.details)) {
        check.response.details.forEach(item => {
          if (item.status === 'Not Fulfilled' || item.status === 'Needs Review') {
            requirementErrors.push([check.name, item.requirement, item.status, item.value_or_comment]);
          }
        });
      }
    });
    addSection('Requirement Check Issues', ['Check', 'Requirement', 'Status', 'Comment'], requirementErrors);

    // 3. Field Validation Errors
    const validationErrors = getValidationErrors(data);
    addSection('Field Validation Errors', ['Section', 'Field', 'Error Message'], validationErrors);

    // 3. Comparable Address Consistency
    const addressInconsistencies = [];
    const getFirstThreeWords = (str) => str ? str.split(/\s+/).slice(0, 3).join(' ').toLowerCase() : '';

    comparableSales.forEach((sale, index) => {
      const compNum = index + 1;
      const salesGridAddress = data[sale]?.Address || '';
      const locationMapAddress = data[`Location Map Address ${compNum}`] || '';
      const photoAddress = data[`Comparable Photo Address ${compNum}`] || '';

      const allAddresses = [salesGridAddress, locationMapAddress, photoAddress];
      const validAddresses = allAddresses.filter(Boolean);

      let isConsistent = false;
      if (validAddresses.length < 2) {
        isConsistent = true;
      } else {
        const shortAddresses = validAddresses.map(getFirstThreeWords);
        const uniqueShortAddresses = new Set(shortAddresses);
        // The logic here seems to check if there's at least one duplicate, not if all are the same.
        // Sticking to the UI logic. For full consistency, it should be uniqueShortAddresses.size === 1.
        if (uniqueShortAddresses.size < shortAddresses.length) {
          isConsistent = true;
        }
      }

      if (!isConsistent) {
        addressInconsistencies.push([`Comp #${compNum}`, salesGridAddress, locationMapAddress, photoAddress]);
      }
    });
    addSection('Comparable Address Inconsistencies', ['Comparable', 'Sales Grid Address', 'Location Map Address', 'Photo Address'], addressInconsistencies);

    // Finalize PDF
    addHeaderFooter();
    doc.save('Appraisal_Error_Log.pdf');
    setNotification({ open: true, message: 'Error log generated successfully.', severity: 'success' });
  };

  const fileUploadTimerRef = useRef(null);

  const handleDataChange = (path, value) => {
    setData(prevData => {
      const newData = { ...prevData };
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };
  const onHtmlFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setHtmlFile(file);
      setNotification({ open: true, message: 'HTML file uploaded. Extracting data...', severity: 'info' });

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');

        const fieldsToExtract = [
          'Client Name', 'Client Address', 'Transaction Type', 'FHA Case Number', 'Borrower (and Co-Borrower)',
          'Property Address', 'Property County', 'Property Type', 'Assigned to Vendor(s)', 'AMC Reg. Number',
          'Appraisal Type', 'Unit Number', 'UAD XML Report'
        ];

        const extractedData = {};
        const allElements = doc.body.querySelectorAll('*');

        fieldsToExtract.forEach(field => {
          extractedData[field] = 'N/A'; // Default value
          for (let i = 0; i < allElements.length; i++) {
            const element = allElements[i];
            if (element.textContent.trim().toLowerCase().replace(/:$/, '') === field.toLowerCase()) {
              const nextElement = element.nextElementSibling;
              if (nextElement) {
                if (field === 'Appraisal Type' || field === 'Transaction Type') {
                  const selectElement = nextElement.querySelector('select');
                  if (selectElement) {
                    const selectedOption = selectElement.querySelector('option[selected]');
                    if (selectedOption) {
                      const selectedText = selectedOption.innerText.trim();
                      if (selectedText !== '-- Select One --') {
                        extractedData[field] = selectedText;
                      }
                      break;
                    }
                  }
                } else {
                  extractedData[field] = nextElement.innerText.trim();
                  break;
                }
              }
            }
          }
        });

        setComparisonData(extractedData);
        // setIsComparisonDialogOpen(true); // Prevent automatic dialog opening
        setNotification({ open: true, message: 'HTML data extracted. Please review.', severity: 'success' });
      };
      reader.readAsText(file);
    }
  };

  const onContractFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setContractFile(file);
      setNotification({ open: true, message: 'Contract file uploaded. Click "Review Contract" to compare.', severity: 'success' });
      // setIsContractCompareOpen(true); // Prevent automatic dialog opening
      // setContractCompareResult(null);
      // setContractCompareError('');
    }
  };

  const handleContractCompare = async () => {
    if (!selectedFile || !contractFile) {
      setNotification({ open: true, message: 'Please upload both the main report and the contract copy.', severity: 'warning' });
      return;
    }
    setContractCompareLoading(true);
    setContractCompareError('');
    setContractCompareResult(null);

    const formData = new FormData();
    formData.append('main_report_file', selectedFile);
    formData.append('contract_copy_file', contractFile);

    try {
      const response = await fetch('https://strdjrbservices2.pythonanywhere.com/api/compare-contract/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to compare documents.');
      }

      const result = await response.json();
      setContractCompareResult(result); // This result will be an array as defined in the prompt

    } catch (error) {
      setContractCompareError(error.message);
      setNotification({ open: true, message: error.message, severity: 'error' });
    } finally {
      setContractCompareLoading(false);
    }
  };

  const handleEngagementLetterCompare = async () => {
    if (!selectedFile || !engagementLetterFile) {
      setNotification({ open: true, message: 'Please upload both the main report and the engagement letter.', severity: 'warning' });
      return;
    }
    setEngagementLetterCompareLoading(true);
    setEngagementLetterCompareError('');
    setEngagementLetterCompareResult(null);

    const formData = new FormData();
    formData.append('main_report_file', selectedFile);
    formData.append('engagement_letter_file', engagementLetterFile);

    try {
      const response = await fetch('https://strdjrbservices2.pythonanywhere.com/api/compare-engagement-letter/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to compare documents.');
      }

      const result = await response.json();
      setEngagementLetterCompareResult(result.comparison_results);

    } catch (error) {
      setEngagementLetterCompareError(error.message);
      setNotification({ open: true, message: error.message, severity: 'error' });
    } finally {
      setEngagementLetterCompareLoading(false);
    }
  };


  const onEngagementLetterFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setEngagementLetterFile(file);
      setNotification({ open: true, message: 'Engagement letter uploaded. Click "Review Letter" to compare.', severity: 'success' });
      // setIsEngagementLetterDialogOpen(true); // Prevent automatic dialog opening
      // setEngagementLetterCompareResult(null);
      // setEngagementLetterCompareError('');
    }
  };

  const handleManualValidation = (fieldPath) => {
    setManualValidations(prev => {
      const pathKey = JSON.stringify(fieldPath);
      const newValidations = { ...prev };
      if (newValidations[pathKey]) {
        delete newValidations[pathKey];
      } else {
        newValidations[pathKey] = true;
      }
      return newValidations;
    });
  };
  const handleComparisonDataChange = (field, value) => {
    setComparisonData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // const handleReviewHtml = () => {
  //   setIsComparisonDialogOpen(true);
  //   // This will open the dialog, and we can trigger the comparison from within the dialog
  //   // when it opens in the "initial" state.
  // };

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScrollTop && window.pageYOffset > 400) {
        setShowScrollTop(true);
      } else if (showScrollTop && window.pageYOffset <= 400) {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScrollTop]);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleThemeChange = () => {
    setThemeMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    return () => {
      localStorage.removeItem('fileUploadStartTime');
      clearInterval(fileUploadTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const startTime = localStorage.getItem('fileUploadStartTime');
    if (startTime) {
      const elapsedSeconds = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
      setFileUploadTimer(elapsedSeconds);
      setIsTimerRunning(true);
    }
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      fileUploadTimerRef.current = setInterval(() => {
        setFileUploadTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(fileUploadTimerRef.current);
    }

    return () => clearInterval(fileUploadTimerRef.current);
  }, [isTimerRunning]);

  const handleTimerToggle = () => {
    setIsTimerRunning(prev => !prev);
  };


  const subjectFields = [
    // 'FHA Case No.',
    // 'Exposure comment',
    // 'Prior service comment',
    // 'ANSI',
    // 'From Type',
    // 'ADU File Check',
    'Property Address',
    'City',
    'County',
    'State',
    'Zip Code',
    'Borrower',
    'Owner of Public Record',
    'Legal Description',
    "Assessor's Parcel #",
    'Tax Year',
    'R.E. Taxes $',
    'Neighborhood Name',
    'Map Reference',
    'Census Tract',
    'Occupant',
    'Special Assessments $',
    'PUD',
    'HOA $',
    'Property Rights Appraised',
    'Assignment Type',
    'Lender/Client',
    'Address (Lender/Client)',
    'Offered for Sale in Last 12 Months',
    'Report data source(s) used, offering price(s), and date(s)',
  ];

  const statesRequiringAppraiserFee = ['AZ', 'CO', 'CT', 'GA', 'IL', 'LA', 'NJ', 'NV', 'NM', 'ND', 'OH', 'UT', 'VA', 'VT', 'WV'];
  const statesRequiringAmcLicense = ['GA', 'IL', 'MT', 'NJ', 'OH', 'VT'];

  const currentState = data?.State?.toUpperCase();

  if (currentState) {
    if (statesRequiringAppraiserFee.includes(currentState)) {
      const feeIndex = subjectFields.indexOf('State') + 1;
      if (!subjectFields.includes("Appraiser's Fee")) {
        subjectFields.splice(feeIndex, 0, "Appraiser's Fee");
      }
    }
    if (statesRequiringAmcLicense.includes(currentState)) {
      let amcIndex = subjectFields.indexOf('State') + 1;
      if (subjectFields.includes("Appraiser's Fee")) {
        amcIndex++;
      }
      if (!subjectFields.includes('AMC License #')) {
        subjectFields.splice(amcIndex, 0, 'AMC License #');
      }
    }
  }


  const highlightedSubjectFields = [
    'Property Address',
    'City',
    'County',
    'State',
    'Zip Code',
    'Borrower',
    'Occupant',
    'Assignment Type',
    'Lender/Client',
    'Address (Lender/Client)',
  ];
  const stateRequirementFields = ["STATE REQUIREMENT FIELDS"];

  const highlightedContractFields = [
    'Contract Price $',
    'Date of Contract',
  ];

  const highlightedSiteFields = [
    "Area",
    "Shape",
    "View",
    "Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?",
    "FEMA Special Flood Hazard Area",
    "FEMA Flood Zone",
    "FEMA Map #",
    "FEMA Map Date",
  ];


  const contractFields = [
    "I did did not analyze the contract for sale for the subject purchase transaction. Explain the results of the analysis of the contract for sale or why the analysis was not performed.",
    "Contract Price $",
    "Date of Contract",
    "Is property seller owner of public record?",
    "Data Source(s)",
    "Is there any financial assistance (loan charges, sale concessions, gift or downpayment assistance, etc.) to be paid by any party on behalf of the borrower?",
    "If Yes, report the total dollar amount and describe the items to be paid"
  ];

  const neighborhoodFields = [
    "Location", "Built-Up", "Growth", "Property Values", "Demand/Supply",
    "Marketing Time", "One-Unit", "2-4 Unit", "Multi-Family", "Commercial", "Other", "Present Land Use for other",
    "one unit housing price(high,low,pred)", "one unit housing age(high,low,pred)",
    "Neighborhood Boundaries", "Neighborhood Description", "Market Conditions:",
  ];

  const siteFields = [
    "Dimensions",
    "Area",
    "Shape",
    "View",
    "Specific Zoning Classification",
    "Zoning Description",
    "Zoning Compliance",
    "Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?",
    "Electricity",
    "Gas",
    "Water",
    "Sanitary Sewer",
    "Street",
    "Alley",
    "FEMA Special Flood Hazard Area",
    "FEMA Flood Zone",
    "FEMA Map #",
    "FEMA Map Date",
    "Are the utilities and off-site improvements typical for the market area? If No, describe",
    "Are there any adverse site conditions or external factors (easements, encroachments, environmental conditions, land uses, etc.)? If Yes, describe"
  ];

  const improvementsFields = [
    "Units", "One with Accessory Unit", "# of Stories", "Type", "Existing/Proposed/Under Const.",
    "Design (Style)", "Year Built", "Effective Age (Yrs)", "Foundation Type",
    "Basement Area sq.ft.", "Basement Finish %",
    "Evidence of", "Foundation Walls (Material/Condition)",
    "Exterior Walls (Material/Condition)", "Roof Surface (Material/Condition)",
    "Gutters & Downspouts (Material/Condition)", "Window Type (Material/Condition)",
    "Storm Sash/Insulated", "Screens", "Floors (Material/Condition)", "Walls (Material/Condition)",
    "Trim/Finish (Material/Condition)", "Bath Floor (Material/Condition)", "Bath Wainscot (Material/Condition)",
    "Attic", "Heating Type", "Fuel", "Cooling Type",
    "Fireplace(s) #", "Patio/Deck", "Pool", "Woodstove(s) #", "Fence", "Porch", "Other Amenities",
    "Car Storage", "Driveway # of Cars", "Driveway Surface", "Garage # of Cars", "Carport # of Cars",
    "Garage Att./Det./Built-in", "Appliances",
    "Finished area above grade Rooms", "Finished area above grade Bedrooms",
    "Finished area above grade Bath(s)", "Square Feet of Gross Living Area Above Grade",
    "Additional features", "Describe the condition of the property",
    "Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property? If Yes, describe",
    "Does the property generally conform to the neighborhood (functional utility, style, condition, use, construction, etc.)?",
    "Does the property generally conform to the neighborhood (functional utility, style, condition, use, construction, etc.)?If Yes, describe"
  ];

  const reconciliationFields = [
    'Indicated Value by: Sales Comparison Approach $',
    'Cost Approach (if developed)',
    'Income Approach (if developed) $',
    'Income Approach (if developed) $ Comment',
    'This appraisal is made "as is", subject to completion per plans and specifications on the basis of a hypothetical condition that the improvements have been completed, subject to the following repairs or alterations on the basis of a hypothetical condition that the repairs or alterations have been completed, or subject to the following required inspection based on the extraordinary assumption that the condition or deficiency does not require alteration or repair:',
    "opinion of the market value, as defined, of the real property that is the subject of this report is $",
    "as of", "final value"
  ];

  const incomeApproachFields = [
    "Estimated Monthly Market Rent $",
    "X Gross Rent Multiplier  = $",
    "Indicated Value by Income Approach",
    "Summary of Income Approach (including support for market rent and GRM) "
  ];

  const costApproachFields = [
    "Estimated",
    "Source of cost data",
    "Quality rating from cost service ",
    "Effective date of cost data ",
    "Comments on Cost Approach (gross living area calculations, depreciation, etc.) ",
    "OPINION OF SITE VALUE = $ ................................................",
    "Dwelling",
    "Garage/Carport ",
    "Estimated Remaining Economic Life (HUD and VA only)",
    " Total Estimate of Cost-New  = $ ...................",
    "Depreciation ",
    "Depreciated Cost of Improvements......................................................=$ ",
    "“As-is” Value of Site Improvements......................................................=$",
    "Indicated Value By Cost Approach......................................................=$",
  ];

  const pudInformationFields = [
    "PUD Fees $",
    "PUD Fees (per month)",
    "PUD Fees (per year)",
    "Is the developer/builder in control of the Homeowners' Association (HOA)?",
    "Unit type(s)",
    "Provide the following information for PUDs ONLY if the developer/builder is in control of the HOA and the subject property is an attached dwelling unit.",
    "Legal Name of Project",
    "Total number of phases",
    "Total number of units",
    "Total number of units sold",
    "Total number of units rented",
    "Total number of units for sale",
    "Data source(s)",
    "Was the project created by the conversion of existing building(s) into a PUD?",
    " If Yes, date of conversion",
    "Does the project contain any multi-dwelling units? Yes No Data",
    "Are the units, common elements, and recreation facilities complete?",
    "If No, describe the status of completion.",
    "Are the common elements leased to or by the Homeowners' Association?",
    "If Yes, describe the rental terms and options.",
    "Describe common elements and recreational facilities."
  ];

  const appraiserFields = [
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

  const supplementalAddendumFields = [
    "SUPPLEMENTAL ADDENDUM",
    "ADDITIONAL COMMENTS",
    "APPRAISER'S CERTIFICATION:",
    "SUPERVISORY APPRAISER'S CERTIFICATION:",
    "Analysis/Comments",
    "GENERAL INFORMATION ON ANY REQUIRED REPAIRS",
    "UNIFORM APPRAISAL DATASET (UAD) DEFINITIONS ADDENDUM",
  ];

  const uniformResidentialAppraisalReportFields = [
    "SCOPE OF WORK:",
    "INTENDED USE:",
    "INTENDED USER:",
    "DEFINITION OF MARKET VALUE:",
    "STATEMENT OF ASSUMPTIONS AND LIMITING CONDITIONS:",
  ];

  const appraisalAndReportIdentificationFields = [
    "This Report is one of the following types:",
    "Comments on Standards Rule 2-3",
    "Reasonable Exposure Time",
    "Comments on Appraisal and Report Identification"
  ];

  const marketConditionsFields = [
    "Instructions:", "Seller-(developer, builder, etc.)paid financial assistance prevalent?",
    "Explain in detail the seller concessions trends for the past 12 months (e.g., seller contributions increased from 3% to 5%, increasing use of buydowns, closing costs, condo fees, options, etc.).",
    "Are foreclosure sales (REO sales) a factor in the market?", "If yes, explain (including the trends in listings and sales of foreclosed properties).",
    "Cite data sources for above information.", "Summarize the above information as support for your conclusions in the Neighborhood section of the appraisal report form. If you used any additional information, such as an analysis of pending sales and/or expired and withdrawn listings, to formulate your conclusions, provide both an explanation and support for your conclusions."
  ];

  const marketConditionsRows = [
    { label: "Total # of Comparable Sales (Settled)", fullLabel: "Inventory Analysis Total # of Comparable Sales (Settled)" },
    { label: "Absorption Rate (Total Sales/Months)", fullLabel: "Inventory Analysis Absorption Rate (Total Sales/Months)" },
    { label: "Total # of Comparable Active Listings", fullLabel: "Inventory Analysis Total # of Comparable Active Listings" },
    { label: "Months of Housing Supply", fullLabel: "Inventory Analysis Months of Housing Supply (Total Listings/Ab.Rate)" },
    { label: "Median Comparable Sale Price", fullLabel: "Median Sale & List Price, DOM, Sale/List % Median Comparable Sale Price" },
    { label: "Median Comparable Sales Days on Market", fullLabel: "Median Sale & List Price, DOM, Sale/List % Median Comparable Sales Days on Market" },
    { label: "Median Comparable List Price", fullLabel: "Median Sale & List Price, DOM, Sale/List % Median Comparable List Price" },
    { label: "Median Comparable Listings Days on Market", fullLabel: "Median Sale & List Price, DOM, Sale/List % Median Comparable Listings Days on Market" },
    { label: "Median Sale Price as % of List Price", fullLabel: "Median Sale & List Price, DOM, Sale/List % Median Sale Price as % of List Price" }
  ];

  const salesHistoryFields = [
    "Date of Prior Sale/Transfer",
    "Price of Prior Sale/Transfer",
    "Data Source(s) for prior sale",
    "Effective Date of Data Source(s) for prior sale"
  ];

  const salesComparisonAdditionalInfoFields = [

    "I did did not research the sale or transfer history of the subject property and comparable sales. If not, explain",
    "My research did did not reveal any prior sales or transfers of the subject property for the three years prior to the effective date of this appraisal.",
    "Data Source(s) for subject property research",
    "My research did did not reveal any prior sales or transfers of the comparable sales for the year prior to the date of sale of the comparable sale.",
    "Data Source(s) for comparable sales research",
    "Analysis of prior sale or transfer history of the subject property and comparable sales",
    "Summary of Sales Comparison Approach",
    "Indicated Value by Sales Comparison Approach $",

  ];

  const infoOfSalesFields = [
    "There are ____ comparable properties currently offered for sale in the subject neighborhood ranging in price from$ ___to $___",
    "There are ___comparable sales in the subject neighborhoodwithin the past twelvemonths ranging in sale price from$___ to $____"
  ];
  const condoForeclosureFields = [
    "Are foreclosure sales (REO sales) a factor in the project?", "If yes, indicate the number of REO listings and explain the trends in listings and sales of foreclosed properties.", "Summarize the above trends and address the impact on the subject unit and project.",
  ];

  // const highlightedSalesComparisonAdditionalInfoFields = [
  //   "There are ____ comparable properties currently offered for sale in the subject neighborhood ranging in price from$ ___to $___",
  //   "There are ___comparable sales in the subject neighborhoodwithin the past twelvemonths ranging in sale price from$___ to $____",
  // ];


  const condoCoopProjectsRows = [
    { label: "Total # of Comparable Sales (Settled)", fullLabel: "Subject Project Data Total # of Comparable Sales (Settled)" },
    { label: "Absorption Rate (Total Sales/Months)", fullLabel: "Subject Project Data Absorption Rate (Total Sales/Months)" },
    { label: "Total # of Comparable Active Listings", fullLabel: "Subject Project Data Total # of Comparable Active Listings" },
    { label: "Months of Unit Supply (Total Listings/Ab.Rate)", fullLabel: "Subject Project Data Months of Unit Supply (Total Listings/Ab.Rate)" },
  ];
  // const condoCoopProjectsFields = [
  //   "Are foreclosure sales (REO sales) a factor in the project?", "If yes, indicate the number of REO listings and explain the trends in listings and sales of foreclosed properties.", "Summarize the above trends and address the impact on the subject unit and project.",
  // ];

  const imageAnalysisFields = [
    "include bedroom, bed, bathroom, bath, half bath, kitchen, lobby, foyer, living room count with label and photo,please explan and match the floor plan with photo and improvement section, GLA",
    "please match comparable address in sales comparison approach and comparable photos, please make sure comp phto are not same, also find front, rear, street photo and make sure it is not same, capture any additionbal photo for adu according to check mark",
    "please match comparable address in sales comparison approach and comparable photos, please make sure comp phto are not same, also find front, rear, street photo and make sure it is not same, capture any additionbal photo for adu according to check mark, please match the same in location map, areial map should have subject address, please check signature section details of appraiser in appraiser license copy for accuracy"
  ];

  const projectSiteFields = [
    "Topography", "Size", "Density", "View", "Specific Zoning Classification", "Zoning Description",
    "Zoning Compliance", "Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?",
    "Electricity", "Gas", "Water", "Sanitary Sewer", "Street", "Alley", "FEMA Special Flood Hazard Area",
    "FEMA Flood Zone", "FEMA Map #", "FEMA Map Date", "Are the utilities and off-site improvements typical for the market area? If No, describe",
    "Are there any adverse site conditions or external factors (easements, encroachments, environmental conditions, land uses, etc.)? If Yes, describe",
  ];

  const projectInfoFields = [
    "Data source(s) for project information", "Project Description", "# of Stories",
    "# of Elevators", "Existing/Proposed/Under Construction", "Year Built",
    "Effective Age", "Exterior Walls",
    "Roof Surface", "Total # Parking", "Ratio (spaces/units)", "Type", "Guest Parking", "# of Units", "# of Units Completed",
    "# of Units For Sale", "# of Units Sold", "# of Units Rented", "# of Owner Occupied Units",
    "# of Phases", "# of Units", "# of Units for Sale", "# of Units Sold", "# of Units Rented", "# of Owner Occupied Units", "# of Planned Phases",
    "# of Planned Units", "# of Planned Units for Sale", "# of Planned Units Sold", "# of Planned Units Rented", "# of Planned Owner Occupied Units",
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

  const projectAnalysisFields = [
    "I did did not analyze the condominium project budget for the current year. Explain the results of the analysis of the budget (adequacy of fees, reserves, etc.), or why the analysis was not performed.",
    "Are there any other fees (other than regular HOA charges) for the use of the project facilities?",
    "If Yes, report the charges and describe.",
    "Compared to other competitive projects of similar quality and design, the subject unit charge appears",
    "If High or Low, describe",
    "Are there any special or unusual characteristics of the project (based on the condominium documents, HOA meetings, or other information) known to the appraiser?",
    "If Yes, describe and explain the effect on value and marketability.",
  ];

  const unitDescriptionsFields = [
    "Unit Charge$", " per month X 12 = $", "per year",
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
    "Finished area above grade contains:", "Rooms", "Bedrooms", "Bath(s)", "Square Feet of Gross Living Area Above Grade",
    "Are the heating and cooling for the individual units separately metered?", "If No, describe and comment on compatibility to other projects in the market area.",
    "Additional features (special energy efficient items, etc.)",
    "Describe the condition of the property (including needed repairs, deterioration, renovations, remodeling, etc.)",
    "Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property? ", "If Yes, describe",
    "Does the property generally conform to the neighborhood (functional utility, style, condition, use, construction, etc.)?", "If No, describe"
  ];

  const priorSaleHistoryFields = [
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
  const dataConsistencyFields = {
    'Bedroom': {
      'Improvements': 'Bedroom Improvements Count',
      'Grid': 'Bedroom Sales Comparison Approach Count',
      'Photo': 'Bedroom Photo Count',
      'Floorplan': 'TOTAL Bedroom Floorplan Count',
    },
    'Bathroom': {
      'Improvements': 'Bathroom Improvements Count',
      'Grid': 'Bathroom Sales Comparison Approach Count',
      'Photo': 'Bathroom Photo Count',
      'Floorplan': 'TOTAL Bathroom Floorplan Count',
    },
    'GLA': { 'Improvements': 'GLA Improvements Count', 'Grid': 'GLA Sales Comparison Approach Count', 'Photo': 'GLA Photo Count', 'Floorplan': 'GLA Floorplan Count' }
  };
  const formTypes = ['1004', '1004C', '1004D', '1025', '1073', '2090', '203k-FHA', '2055', '1075', '2095', '1007', '216'];

  const sections = useMemo(() => [
    { id: 'subject-info', title: 'Subject', category: 'SUBJECT' }, // Root level data
    // { id: 'html-data-section', title: 'HTML Data' },
    { id: 'contract-section', title: 'Contract', category: 'CONTRACT' },
    { id: 'neighborhood-section', title: 'Neighborhood', category: 'NEIGHBORHOOD' },

    { id: 'project-site-section', title: 'Project Site', category: 'PROJECT_SITE' },
    { id: 'project-info-section', title: 'Project Information', category: 'PROJECT_INFO' },
    { id: 'project-analysis-section', title: 'Project Analysis', category: 'PROJECT_ANALYSIS' },
    { id: 'unit-descriptions-section', title: 'Unit Descriptions', category: 'UNIT_DESCRIPTIONS' },
    { id: 'prior-sale-history-section', title: 'Prior Sale History', category: 'PRIOR_SALE_HISTORY' },
    { id: 'site-section', title: 'Site', category: 'SITE' },
    { id: 'info-of-sales-section', title: 'Info of Sales', category: 'INFO_OF_SALES' },
    { id: 'improvements-section', title: 'Improvements', category: 'IMPROVEMENTS' },
    { id: 'sales-comparison', title: 'Sales Comparison & History', category: ['SALES_GRID'] },
    // { id: 'sales-comparison-additional-info', title: 'Sales Comparison Additional Info', category: 'SALES_COMPARISON_ADDITIONAL_INFO' },
    { id: 'sales-history-section', title: 'Sales History', category: 'SALES_TRANSFER' },
    { id: 'rent-schedule-section', title: 'Comparable Rent Schedule', category: 'RENT_SCHEDULE_GRID' },
    { id: 'reconciliation-section', title: 'Reconciliation', category: 'RECONCILIATION' },
    { id: 'rent-schedule-reconciliation-section', title: 'Rent Schedule Reconciliation', category: 'RENT_SCHEDULE_RECONCILIATION' },
    { id: 'cost-approach-section', title: 'Cost Approach', category: 'COST_APPROACH' },
    { id: 'income-approach-section', title: 'Income Approach', category: 'INCOME_APPROACH' },
    { id: 'pud-info-section', title: 'PUD Information', category: 'PUD_INFO' },
    { id: 'market-conditions-section', title: 'Market Conditions', category: 'MARKET_CONDITIONS' },
    { id: 'condo-coop-section', title: 'Condo/Co-op', category: ['CONDO', 'CONDO_FORECLOSURE'] },
    { id: 'appraiser-section', title: 'CERTIFICATION', category: 'CERTIFICATION' }, // This should be condo coop projects
    { id: 'prompt-analysis-section', title: 'Prompt Analysis' },
    { id: 'raw-output', title: 'Raw Output' },

  ], []);

  const salesGridRows = [

    { label: "Address", valueKey: "Address", subjectValueKey: "Property Address" },
    { label: "Proximity to Subject", valueKey: "Proximity to Subject", subjectValueKey: "" },
    { label: "Sale Price", valueKey: "Sale Price" },
    { label: "Sale Price/GLA", valueKey: "Sale Price/Gross Liv. Area" },
    { label: "Data Source(s)", valueKey: "Data Source(s)" },
    { label: "Verification Source(s)", valueKey: "Verification Source(s)" },
    { label: "Sale or Financing Concessions", valueKey: "Sale or Financing Concessions", adjustmentKey: "Sale or Financing Concessions Adjustment" },
    { label: "Date of Sale/Time", valueKey: "Date of Sale/Time", adjustmentKey: "Date of Sale/Time Adjustment" },
    { label: "Location", valueKey: "Location", adjustmentKey: "Location Adjustment" },
    { label: "Leasehold/Fee Simple", valueKey: "Leasehold/Fee Simple", adjustmentKey: "Leasehold/Fee Simple Adjustment" },
    { label: "Site", valueKey: "Site", adjustmentKey: "Site Adjustment" },
    { label: "View", valueKey: "View", adjustmentKey: "View Adjustment" },
    { label: "Design (Style)", valueKey: "Design (Style)", adjustmentKey: "Design (Style) Adjustment" },
    { label: "Quality of Construction", valueKey: "Quality of Construction", adjustmentKey: "Quality of Construction Adjustment" },
    { label: "Actual Age", valueKey: "Actual Age", adjustmentKey: "Actual Age Adjustment" },
    { label: "Condition", valueKey: "Condition", adjustmentKey: "Condition Adjustment" },
    { label: "Total Rooms", valueKey: "Total Rooms" },
    { label: "Bedrooms", valueKey: "Bedrooms", adjustmentKey: "Bedrooms Adjustment" },
    { label: "Baths", valueKey: "Baths", adjustmentKey: "Baths Adjustment" },
    // { label: "Above Grade Room Count Adjustment", valueKey: "Above Grade Room Count Adjustment", isAdjustmentOnly: true },
    { label: "Gross Living Area", valueKey: "Gross Living Area", adjustmentKey: "Gross Living Area Adjustment" },
    { label: "Basement & Finished", valueKey: "Basement & Finished Rooms Below Grade", adjustmentKey: "Basement & Finished Rooms Below Grade Adjustment" },
    { label: "Functional Utility", valueKey: "Functional Utility", adjustmentKey: "Functional Utility Adjustment" },
    { label: "Heating/Cooling", valueKey: "Heating/Cooling", adjustmentKey: "Heating/Cooling Adjustment" },
    { label: "Energy Efficient Items", valueKey: "Energy Efficient Items", adjustmentKey: "Energy Efficient Items Adjustment" },
    { label: "Garage/Carport", valueKey: "Garage/Carport", adjustmentKey: "Garage/Carport Adjustment" },
    { label: "Porch/Patio/Deck", valueKey: "Porch/Patio/Deck", adjustmentKey: "Porch/Patio/Deck Adjustment" },
    { label: "Net Adjustment (Total)", valueKey: "Net Adjustment (Total)" },
    { label: "Adjusted Sale Price", valueKey: "Adjusted Sale Price of Comparable" },
  ];

  const rentScheduleReconciliationFields = [
    "Comments on market data, including the range of rents for single family properties, an estimate of vacancy for single family rental properties, the general trend of rents and vacancy, and support for the above adjustments. (Rent concessions should be adjusted to the market, not to the subject property.)",
    "Final Reconciliation of Market Rent:",
    "I (WE) ESTIMATE THE MONTHLY MARKET RENT OF THE SUBJECT AS OF",
    "TO BE $",
  ];

  const RentSchedulesFIELDS2 = [
    "Address",
    "Proximity to Subject",
    "Date Lease Begins",
    "Date Lease Expires",
    "Monthly Rental",
    "Less: Utilities",
    "Furniture",
    "Adjusted Monthly Rent",
    "Data Source",
    "Rent",
    "Concessions",
    "Location/View",
    "Design and Appeal",
    "Age/Condition",
    "Room Count Total",
    "Room Count Bdrms",
    "Room Count Baths",
    "Gross Living Area",
    "Other (e.g., basement, etc.)",
    "Other:",
    "Net Adj. (total)",
    "Indicated Monthly Market Rent",
  ];



  const comparableSales = [
    "COMPARABLE SALE #1",
    "COMPARABLE SALE #2",
    "COMPARABLE SALE #3",
    "COMPARABLE SALE #4",
    "COMPARABLE SALE #5",
    "COMPARABLE SALE #6",
    "COMPARABLE SALE #7",
    "COMPARABLE SALE #8",
    "COMPARABLE SALE #9",

  ];

  const comparableRents = [
    "COMPARABLE RENT #1",
    "COMPARABLE RENT #2",
    "COMPARABLE RENT #3",
    "COMPARABLE RENT #4",
    "COMPARABLE RENT #5",
    "COMPARABLE RENT #6",
    "COMPARABLE RENT #7",
    "COMPARABLE SALE #8",
    "COMPARABLE SALE #9",
  ];

  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0];

    // Reset all relevant states when a new file is selected
    setData({});
    setExtractionAttempted(false);
    setLastExtractionTime(null);
    setRawGemini('');
    setPromptAnalysisResponse(null);
    setSubmittedPrompt('');
    setStateReqResponse(null);
    setUnpaidOkResponse(null);
    setClientReqResponse(null);
    setFhaResponse(null);
    setADUResponse(null);
    setActiveSection(null);
    setModalContent(null);
    setContractExtracted(false);

    if (file) {
      setSelectedFile(file);
      localStorage.setItem('fileUploadStartTime', Date.now().toString());
      setNotification({
        open: true, message: 'File uploaded successfully.', severity: 'success'
      });
      setFileUploadTimer(0);
      setIsTimerRunning(true);
      extractInitialSections(); // Trigger initial extraction
      // We will no longer trigger initial extraction on file change.
      // The user can extract sections via the sidebar.
      // This prevents errors if the API is not ready or if the user
      // changes their mind.
      // If you want to restore this, you can call:
      // extractInitialSections();
    }
  };

  useEffect(() => {

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const [rawGemini, setRawGemini] = useState('');

  const validateInputs = () => {
    if (!selectedFormType) {
      setNotification({ open: true, message: 'Please select a Form Type first.', severity: 'warning' });
      return false;
    }
    if (!selectedFile) {
      setNotification({ open: true, message: 'Please select a file first.', severity: 'warning' });
      return false;
    }
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setNotification({ open: true, message: 'Only PDF files are supported.', severity: 'error' });
      return false;
    }
    return true;
  };

  const startExtractionProcess = () => {
    setLoading(true);
    setExtractionAttempted(true);
    setExtractionProgress(0);
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const callExtractionAPI = async (formType, category, onRetry) => {
    setExtractionProgress(10);
    const retries = 3;
    let progressInterval;
    const delay = 1000;

    for (let i = 0; i < retries; i++) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile); // Ensure the actual file object is sent
        formData.append('form_type', formType);
        if (category) {
          formData.append('category', category);
        }

        progressInterval = setInterval(() => {
          setExtractionProgress(prev => (prev < 40 ? prev + 5 : prev));
        }, 500);

        const response = await fetch('https://strdjrbservices2.pythonanywhere.com/api/extract/', {
          method: 'POST', body: formData
        });

        if (!response.ok) {
          let error;
          try {
            const err = await response.json();
            error = new Error(err.error || 'Extraction failed with a non-JSON response.');
          } catch (jsonError) {
            const errorText = await response.text();
            error = new Error(errorText || 'An unknown extraction error occurred.');
          }
          throw error;
        }
        clearInterval(progressInterval);
        setExtractionProgress(90);
        return await response.json();
      } catch (error) {
        if (progressInterval) clearInterval(progressInterval);
        if (i < retries - 1) {
          const currentDelay = delay * Math.pow(2, i);
          onRetry(i + 1, retries);
          await new Promise(res => setTimeout(res, currentDelay));
        } else {
          throw error;
        }
      }
    }
  };

  const processExtractionResult = (result, startTime, category) => {
    const normalizedFields = {};
    const longUtilField = "Utilities included in the unit monthly assessment [None/Heat/Air/Conditioning/Electricity/Gas/Water/Sewer/Cable/Other (describe)]";
    if (result.fields && result.fields[longUtilField]) {
      result.fields["Utilities included in the unit monthly assessment"] = result.fields[longUtilField];
    }

    if (result.fields && result.fields['From Type']) {
      const extractedFormType = String(result.fields['From Type'] || '').replace(/[^0-9a-zA-Z-]/g, '');
      if (formTypes.includes(extractedFormType)) {
        setSelectedFormType(extractedFormType);
        setNotification({
          open: true,
          message: `Form type automatically set to '${extractedFormType}'.`,
          severity: 'success'
        });
      } else if (extractedFormType) {
        setNotification({ open: true, message: `Extracted form type '${extractedFormType}' is not supported. Please select manually.`, severity: 'warning' });
      }
    }

    Object.keys(result.fields || {}).forEach(key => {
      if (key.toUpperCase() === "SUBJECT") {
        normalizedFields["Subject"] = result.fields[key];
      } else {
        normalizedFields[key] = result.fields[key];
      }
    });
    Object.assign(normalizedFields, result.fields);

    setData(prevData => {
      const updatedData = { ...prevData, ...normalizedFields };
      // Ensure nested objects are merged, not replaced
      Object.keys(normalizedFields).forEach(key => {
        if (typeof normalizedFields[key] === 'object' && normalizedFields[key] !== null && !Array.isArray(normalizedFields[key])) {
          updatedData[key] = { ...(prevData[key] || {}), ...normalizedFields[key] };
        }
      });
      return updatedData;
    });
    setRawGemini(result.raw || '');
    const durationInMs = Date.now() - startTime;
    const totalSeconds = Math.floor(durationInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Only show success notification if the 'From Type' warning isn't already active.
    if (notification.severity !== 'warning' || !notification.message.startsWith('From Type is')) {
      const sectionName = category ? `${category.replace(/_/g, ' ').toLowerCase()} section` : 'extraction';
      let durationMessage = '';
      if (minutes > 0) {
        durationMessage += `${minutes}m `;
      }
      durationMessage += `${seconds}s`;
      setNotification({
        open: true,
        message: <>Extraction of <strong style={{ color: '#000000' }}>{sectionName}</strong> completed in {durationMessage}.</>,
        severity: 'success'
      });
    }
    setLastExtractionTime(totalSeconds.toFixed(1));
    setExtractionProgress(100);
  };

  const handleExtract = async (category, sectionId) => {
    setNotification({ open: false, message: '', severity: 'info' });
    if (!validateInputs()) return;
    // If no category is provided, and the user clicks the main extract button,
    // we should probably extract everything. For now, we require a section.
    // This logic can be adjusted based on desired behavior for a "full extract" button.
    if (!category && !selectedFile) {
      setNotification({ open: true, message: 'Please select a section from the sidebar to extract.', severity: 'info' }); // This logic can be adjusted based on desired behavior for a "full extract" button.
      return;
    }

    startExtractionProcess();
    const startTime = Date.now();
    const categories = Array.isArray(category) ? category : [category];

    setLoadingSection(sectionId);
    setExtractedSections(prev => new Set(prev).add(sectionId));
    const extractionPromises = categories.map(cat =>
      callExtractionAPI(selectedFormType, cat, (attempt, maxAttempts) => {
        setNotification({ open: true, message: `Extraction for ${cat} failed. Retrying... (Attempt ${attempt}/${maxAttempts})`, severity: 'warning' });
      }).then(result => ({ category: cat, result }))
    );

    try {
      const results = await Promise.allSettled(extractionPromises);
      results.forEach(p => {
        if (p.status === 'fulfilled') {
          processExtractionResult(p.value.result, startTime, p.value.category);
          if (p.value.category === 'CONTRACT') {
            setContractExtracted(true);
          }
        } else {
          setNotification({ open: true, message: p.reason.message || `An unknown error occurred during extraction.`, severity: 'error' });
        }
      });
    } catch (e) {
      setNotification({ open: true, message: e.message || 'An unexpected error occurred during extraction.', severity: 'error' });
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
      setLoadingSection(null);
      if (extractionProgress !== 100) setExtractionProgress(0);
    }
  };

  const extractInitialSections = async () => {
    if (!selectedFile || !selectedFormType) return;
    if (!selectedFile || !selectedFormType) {
      // Do not proceed if there is no file.
      // This prevents sending an empty request on page load.
      return;
    }

    const initialCategories = ['SUBJECT'];
    setLoading(true);
    setExtractionAttempted(true);
    setTimer(0);
    timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);

    // Process requests sequentially instead of in parallel to avoid overloading the server.
    for (const category of initialCategories) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('form_type', selectedFormType);
        formData.append('category', category);

        const res = await fetch('https://strdjrbservices2.pythonanywhere.com/api/extract/', { method: 'POST', body: formData });

        if (!res.ok) {
          throw new Error(`Failed to extract ${category}`);
        }

        const result = await res.json();
        processExtractionResult(result, Date.now(), category);
      } catch (error) {
        console.error(error);
      }
    }

    setLoading(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handlePromptAnalysis = async (prompt) => {
    if (!selectedFile) {
      setPromptAnalysisError('Please select a PDF file first.');
      return;
    }

    setPromptAnalysisLoading(true);
    setPromptAnalysisError('');
    setPromptAnalysisResponse(null);
    setModalContent(null);
    setStateReqResponse(null);
    setUnpaidOkResponse(null);
    setClientReqResponse(null);
    setFhaResponse(null);
    setADUResponse(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('form_type', selectedFormType);
    formData.append('comment', prompt);

    try {
      const res = await fetch('https://strdjrbservices2.pythonanywhere.com/api/extract/', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.detail || `HTTP error! status: ${res.status}`);
      }

      setPromptAnalysisResponse(result.fields);
      setSubmittedPrompt(prompt);
    } catch (e) {
      setPromptAnalysisError(e.message || 'An unexpected error occurred.');
    } finally {
      setPromptAnalysisLoading(false);
    }
  };

  // Helper function for API calls with retry logic
  const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    const timeout = 60000; // 60 seconds timeout
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const res = await fetch(url, { ...options, signal: controller.signal });
        // If response is not a 5xx error, return it
        clearTimeout(id);
        if (res.status < 500) {
          return res;
        }
        // If it is a 5xx error, log and prepare to retry
        console.warn(`Attempt ${i + 1}: Server error ${res.status}. Retrying in ${delay / 1000}s...`);
      } catch (error) {
        // Network or other fetch errors
        console.warn(`Attempt ${i + 1}: Network error. Retrying in ${delay / 1000}s...`, error);
      }
      // Wait for the delay before the next attempt
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve));
        delay *= 2; // Exponential backoff
      }
    }
    throw new Error(`Failed to fetch from ${url} after ${retries} attempts.`);
  };

  const handleStateRequirementCheck = async (forceReload = false) => {
    if (!selectedFile) {
      setStateReqError('Please select a PDF file first.');
      return;
    }

    if (stateReqResponse && !forceReload) {
      setModalContent({
        title: 'State Requirement Check',
        Component: StateRequirementCheck,
        props: { loading: false, response: stateReqResponse, error: stateReqError }
      });
      setIsCheckModalOpen(true);
      return;
    }

    setStateReqLoading(true);
    setStateReqError('');
    setStateReqResponse(null);
    setFhaLoading(true);
    setFhaError('');
    setFhaResponse(null);

    setADULoading(true);
    setADUError('');
    setADUResponse(null);
    setModalContent({
      title: 'State Requirement Check',
      Component: StateRequirementCheck,
      props: { loading: true }
    });
    setIsCheckModalOpen(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('form_type', selectedFormType);
    formData.append('comment', STATE_REQUIREMENTS_PROMPT);

    try {
      const res = await fetchWithRetry('https://strdjrbservices2.pythonanywhere.com/api/extract/', {
        method: 'POST',
        body: formData,

      }, 3, 1000); // 3 retries, starting with a 1-second delay

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || `HTTP error! status: ${res.status}`);
      }
      const responseData = result.fields || result;
      setStateReqResponse(responseData);
      setModalContent({
        title: 'State Requirement Check',
        Component: StateRequirementCheck,
        props: { loading: false, response: responseData, error: '' }
      });
    } catch (e) {
      const errorMsg = e.message || 'An unexpected error occurred.';
      setStateReqError(errorMsg);
      setModalContent({
        title: 'State Requirement Check',
        Component: StateRequirementCheck,
        props: { loading: false, response: null, error: errorMsg }
      });
    } finally {
      setStateReqLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  const handleUnpaidOkCheck = async (forceReload = false) => {
    if (!selectedFile) {
      setUnpaidOkError('Please select a PDF file first.');
      return;
    }

    if (unpaidOkResponse && !forceReload) {
      setModalContent({
        title: 'Unpaid OK Lender Check',
        Component: UnpaidOkCheck,
        props: { loading: false, response: unpaidOkResponse, error: unpaidOkError }
      });
      setIsCheckModalOpen(true);
      return;
    }

    setUnpaidOkLoading(true);
    setUnpaidOkError('');
    setUnpaidOkResponse(null);

    setModalContent({
      title: 'Unpaid OK Lender Check',
      Component: UnpaidOkCheck,
      props: { loading: true }
    });
    setIsCheckModalOpen(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('form_type', selectedFormType);
    formData.append('comment', UNPAID_OK_PROMPT);

    try {
      const res = await fetch('https://strdjrbservices2.pythonanywhere.com/api/extract/', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || `HTTP error! status: ${res.status}`);
      }
      const responseData = result.fields || result;
      setUnpaidOkResponse(responseData);
      setModalContent({
        title: 'Unpaid OK Lender Check',
        Component: UnpaidOkCheck,
        props: { loading: false, response: responseData, error: '' }
      });
    } catch (e) {
      const errorMsg = e.message || 'An unexpected error occurred.';
      setUnpaidOkError(errorMsg);
      setModalContent({
        title: 'Unpaid OK Lender Check',
        Component: UnpaidOkCheck,
        props: { loading: false, response: null, error: errorMsg }
      });
    } finally {
      setUnpaidOkLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  const handleClientRequirementCheck = async (forceReload = false) => {
    if (!selectedFile) {
      setClientReqError('Please select a PDF file first.');
      return;
    }

    if (clientReqResponse && !forceReload) {
      setModalContent({
        title: 'Client Requirement Check',
        Component: ClientRequirementCheck,
        props: { loading: false, response: clientReqResponse, error: clientReqError }
      });
      setIsCheckModalOpen(true);
      return;
    }

    setClientReqLoading(true);
    setClientReqError('');
    setClientReqResponse(null);

    setModalContent({
      title: 'Client Requirement Check',
      Component: ClientRequirementCheck,
      props: { loading: true }
    });
    setIsCheckModalOpen(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('form_type', selectedFormType);
    formData.append('comment', CLIENT_REQUIREMENT_PROMPT);

    try {
      const res = await fetch('https://strdjrbservices2.pythonanywhere.com/api/extract/', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || `HTTP error! status: ${res.status}`);
      }
      const responseData = result.fields || result;
      setClientReqResponse(responseData);
      setModalContent({
        title: 'Client Requirement Check',
        Component: ClientRequirementCheck,
        props: { loading: false, response: responseData, error: '' }
      });
    } catch (e) {
      const errorMsg = e.message || 'An unexpected error occurred.';
      setClientReqError(errorMsg);
      setModalContent({
        title: 'Client Requirement Check',
        Component: ClientRequirementCheck,
        props: { loading: false, response: null, error: errorMsg }
      });
    } finally {
      setClientReqLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  const handleFhaCheck = async (forceReload = false) => {
    if (!selectedFile) {
      setFhaError('Please select a PDF file first.');
      return;
    }

    if (fhaResponse && !forceReload) {
      setModalContent({
        title: 'FHA Requirement Check',
        Component: FhaCheck,
        props: { loading: false, response: fhaResponse, error: fhaError }
      });
      setIsCheckModalOpen(true);
      return;
    }

    setFhaLoading(true);
    setFhaError('');
    setFhaResponse(null);

    setModalContent({
      title: 'FHA Requirement Check',
      Component: FhaCheck,
      props: { loading: true }
    });
    setIsCheckModalOpen(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('form_type', selectedFormType);
    formData.append('comment', ADU_REQUIREMENTS_PROMPT);
    formData.append('comment', FHA_REQUIREMENTS_PROMPT);

    try {
      const res = await fetch('https://strdjrbservices2.pythonanywhere.com/api/extract/', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || `HTTP error! status: ${res.status}`);
      }
      const responseData = result.fields || result;
      setFhaResponse(responseData);
      setModalContent({
        title: 'FHA Requirement Check',
        Component: FhaCheck,
        props: { loading: false, response: responseData, error: '' }
      });
    } catch (e) {
      const errorMsg = e.message || 'An unexpected error occurred.';
      setFhaError(errorMsg);
      setModalContent({
        title: 'FHA Requirement Check',
        Component: FhaCheck,
        props: { loading: false, response: null, error: errorMsg }
      });
    } finally {
      setFhaLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  const handleADUCheck = async (forceReload = false) => {
    if (!selectedFile) {
      setADUError('Please select a PDF file first.');
      return;
    }

    if (ADUResponse && !forceReload) {
      setModalContent({
        title: 'ADU File Check',
        Component: ADUCheck,
        props: { loading: false, response: ADUResponse, error: ADUError }
      });
      setIsCheckModalOpen(true);
      return;
    }

    setADULoading(true);
    setADUError('');
    setADUResponse(null);

    setModalContent({
      title: 'ADU File Check',
      Component: ADUCheck,
      props: { loading: true }
    });
    setIsCheckModalOpen(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('form_type', selectedFormType);
    formData.append('comment', ADU_REQUIREMENTS_PROMPT);

    try {
      const res = await fetch('https://strdjrbservices2.pythonanywhere.com/api/extract/', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || `HTTP error! status: ${res.status}`);
      }
      const responseData = result.fields || result;
      setADUResponse(responseData);
      setModalContent({
        title: 'ADU File Check',
        Component: ADUCheck,
        props: { loading: false, response: responseData, error: '' }
      });
    } catch (e) {
      const errorMsg = e.message || 'An unexpected error occurred.';
      setADUError(errorMsg);
      setModalContent({
        title: 'ADU File Check',
        Component: ADUCheck,
        props: { loading: false, response: null, error: errorMsg }
      });
    } finally {
      setADULoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
    }
  };
  const handleEscalationCheck = async (forceReload = false) => {
    if (!selectedFile) {
      setEscalationError('Please select a PDF file first.');
      return;
    }

    if (escalationResponse && !forceReload) {
      setModalContent({
        title: 'Escalation Check',
        Component: EscalationCheck,
        props: { loading: false, response: escalationResponse, error: escalationError }
      });
      setIsCheckModalOpen(true);
      return;
    }

    setEscalationLoading(true);
    setEscalationError('');
    setEscalationResponse(null);

    setModalContent({
      title: 'Escalation Check',
      Component: EscalationCheck,
      props: { loading: true }
    });
    setIsCheckModalOpen(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('form_type', selectedFormType);
    formData.append('comment', ESCALATION_CHECK_PROMPT);

    try {
      const res = await fetch('https://strdjrbservices2.pythonanywhere.com/api/extract/', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || `HTTP error! status: ${res.status}`);
      }
      const responseData = result.fields || result;
      setEscalationResponse(responseData);
      setModalContent({
        title: 'Escalation Check',
        Component: EscalationCheck,
        props: { loading: false, response: responseData, error: '' }
      });
    } catch (e) {
      const errorMsg = e.message || 'An unexpected error occurred.';
      setEscalationError(errorMsg);
      setModalContent({
        title: 'Escalation Check',
        Component: EscalationCheck,
        props: { loading: false, response: null, error: errorMsg }
      });
    } finally {
      setEscalationLoading(false);
    }
  };

  const handleSectionClick = (section) => {
    setActiveSection(section.id);
    const element = document.getElementById(section.id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (!section.category) {
      // If the section doesn't have a specific category to extract, just scroll.
      return;
    }

    setNotification({ open: true, message: `Extracting ${section.title}...`, severity: 'info' });
    handleExtract(section.category, section.id);
  };

  const handleArrowClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSections(prev => {
          const newVisible = new Set(prev);
          entries.forEach(entry => {
            if (entry.isIntersecting) newVisible.add(entry.target.id);
            else newVisible.delete(entry.target.id);
          });
          return newVisible;
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    );
    sections.forEach(section => { const el = document.getElementById(section.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [data, sections]);
  useEffect(() => {
    // Remove previous highlight
    document.querySelectorAll('.section-active').forEach(el => {
      el.classList.remove('section-active');
    });

    // Add highlight to the new active section
    if (activeSection) {
      const element = document.getElementById(activeSection);
      if (element) {
        element.classList.add('section-active');
      }
    }
  }, [activeSection]);

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  useEffect(() => {
    if (notification.open) {
      if (notification.severity === 'success' || notification.severity === 'upload') {
        playSound(notification.severity);
      } else if (notification.severity === 'error' || notification.severity === 'warning') {
        playSound('error');
      }
    }
  }, [notification]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Show confirmation message if there is data or a file selected
      if (Object.keys(data).length > 0 || selectedFile) {
        event.preventDefault();
        // Required for Chrome
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [data, selectedFile]);

  const handleGeneratePdf = () => {
    if (Object.keys(data).length === 0) {
      setNotification({ open: true, message: 'No data to generate PDF.', severity: 'warning' });
      return;
    }

    setIsGeneratingPdf(true);
    setTimeout(() => { // Use setTimeout to allow UI to update
      try {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 15;
        let yPos = margin;

        const addHeaderFooter = () => {
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            // Header
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('Appraisal Report Summary', margin, 10);
            doc.text(new Date().toLocaleDateString(), pageWidth - margin, 10, { align: 'right' });
            // Footer
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          }
        };

        const addSection = (title, sectionFields, sectionData, usePre = false) => {
          if (!sectionData || sectionFields.every(field => !sectionData[field])) return;

          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = margin;
          }

          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(40);
          doc.text(title, margin, yPos);
          yPos += 8;

          const body = sectionFields.map(field => {
            let value = sectionData[field];
            if (typeof value === 'object' && value !== null) {
              value = Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('\n');
            }
            return [field, value || ''];
          }).filter(row => row[1]);

          if (body.length > 0) {
            autoTable(doc, {
              startY: yPos,
              head: [['Field', 'Value']],
              body: body,
              theme: 'grid',
              headStyles: { fillColor: [22, 160, 133], textColor: 255 },
              columnStyles: { 0: { cellWidth: 60 } },
              didDrawPage: (data) => { yPos = data.cursor.y + 10; },
              willDrawCell: (data) => {
                if (data.section === 'body' && usePre) {
                  doc.setFont('Courier');
                }
              }
            });
            yPos = doc.lastAutoTable.finalY + 10;
          } else {
            yPos -= 8;
          }
        };

        const sectionDefinitions = [
          { id: 'subject-info', title: 'Subject Information', fields: subjectFields, data: data.Subject || data },
          { id: 'contract-section', title: 'Contract', fields: contractFields, data: data.CONTRACT },
          { id: 'neighborhood-section', title: 'Neighborhood', fields: neighborhoodFields, data: data.NEIGHBORHOOD },
          { id: 'site-section', title: 'Site', fields: siteFields, data: data.SITE },
          { id: 'improvements-section', title: 'Improvements', fields: improvementsFields, data: data.IMPROVEMENTS },
          { id: 'sales-history-section', title: 'Sales History', fields: salesHistoryFields, data: data.SALES_TRANSFER },
          { id: 'prior-sale-history-section', title: 'Prior Sale History', fields: priorSaleHistoryFields, data: data.PRIOR_SALE_HISTORY, usePre: true },
          { id: 'reconciliation-section', title: 'Reconciliation', fields: reconciliationFields, data: data.RECONCILIATION },
          { id: 'cost-approach-section', title: 'Cost Approach', fields: costApproachFields, data: data.COST_APPROACH },
          { id: 'income-approach-section', title: 'Income Approach', fields: incomeApproachFields, data: data.INCOME_APPROACH },
          { id: 'pud-info-section', title: 'PUD Information', fields: pudInformationFields, data: data.PUD_INFO },
          { id: 'market-conditions-section', title: 'Market Conditions Addendum', fields: marketConditionsFields, data: data.MARKET_CONDITIONS, usePre: true },
          { id: 'appraiser-section', title: 'Certification/Signature Section', fields: appraiserFields, data: data.CERTIFICATION },
        ];

        const extractedPdfSections = sectionDefinitions.filter(section =>
          extractedSections.has(section.id) && section.data && Object.keys(section.data).length > 0
        );

        extractedPdfSections.forEach(section => {
          addSection(section.title, section.fields, section.data, section.usePre)
        });


        if (extractedSections.has('sales-comparison') && (data.Subject || comparableSales.some(s => data[s]))) {
          if (yPos > pageHeight - 60) { doc.addPage(); yPos = margin; }
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(40);
          doc.text('Sales Comparison Approach', margin, yPos);
          yPos += 8;

          const activeComps = comparableSales.filter(sale => data[sale]);
          const head = [['Feature', 'Subject', ...activeComps]];
          const body = salesGridRows.map(row => {
            const rowData = [row.label];
            // Subject
            let subjectValue = data.Subject?.[row.valueKey] || data.Subject?.[row.subjectValueKey] || '';
            if (row.adjustmentKey && data.Subject?.[row.adjustmentKey]) {
              subjectValue += `\n(${data.Subject[row.adjustmentKey]})`;
            }
            rowData.push(subjectValue);
            // Comparables
            activeComps.forEach(sale => {
              let compValue = data[sale]?.[row.valueKey] || '';
              if (row.adjustmentKey && data[sale]?.[row.adjustmentKey]) {
                compValue += `\n(${data[sale][row.adjustmentKey]})`;
              }
              rowData.push(compValue);
            });
            return rowData;
          });

          autoTable(doc, {
            startY: yPos,
            head,
            body,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 1 },
            headStyles: { fillColor: [22, 160, 133], textColor: 255, fontSize: 8 },
            didDrawPage: (data) => { yPos = data.cursor.y + 10; }
          });
        }

        addHeaderFooter();
        doc.save('Appraisal_Report_Summary.pdf');
        setNotification({ open: true, message: 'PDF generated successfully.', severity: 'success' });
      } catch (error) {
        console.error("Failed to generate PDF:", error);
        setNotification({ open: true, message: 'An error occurred while generating the PDF.', severity: 'error' });
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 100); // 100ms delay
  };


  const getVisibleSections = () => {
    const baseSections = sections.map(s => s.id);
    let visibleSectionIds = [];

    switch (selectedFormType) {
      case '1004':
        visibleSectionIds = baseSections.filter(id => !['rent-schedule-section', 'prior-sale-history-section', 'rent-schedule-reconciliation-section', 'project-site-section', 'project-info-section', 'project-analysis-section', 'unit-descriptions-section'].includes(id));
        break;
      case '1073':
        visibleSectionIds = baseSections.filter(id => !['rent-schedule-section', 'improvements-section', 'site-section', 'rent-schedule-reconciliation-section', 'pud-info-section', 'market-conditions-section'].includes(id));
        break;
      case '1007':
        visibleSectionIds = baseSections.filter(id => !['project-site-section', 'prior-sale-history-section', 'project-info-section', 'project-analysis-section', 'unit-descriptions-section', 'pud-info-section', 'market-conditions-section'].includes(id));
        break;
      default:

        visibleSectionIds = baseSections.filter(id => !['rent-schedule-section', 'rent-schedule-reconciliation-section', 'project-site-section', 'project-info-section', 'project-analysis-section', 'unit-descriptions-section']);
        break;
    }

    return sections.filter(section => visibleSectionIds.includes(section.id));
  };

  const renderForm = () => {
    const props = { data, allData: data, extractionAttempted, handleDataChange, editingField, setEditingField, isEditable, highlightedSubjectFields, highlightedContractFields, highlightedSiteFields, subjectFields, contractFields, neighborhoodFields, siteFields, improvementsFields, salesGridRows, comparableSales, salesComparisonAdditionalInfoFields, salesHistoryFields, priorSaleHistoryFields, reconciliationFields, costApproachFields, incomeApproachFields, pudInformationFields, marketConditionsFields, marketConditionsRows, condoCoopProjectsRows, condoForeclosureFields, appraiserFields, supplementalAddendumFields, uniformResidentialAppraisalReportFields, appraisalAndReportIdentificationFields, projectSiteFields, projectInfoFields, projectAnalysisFields, unitDescriptionsFields, imageAnalysisFields, dataConsistencyFields, comparableRents, RentSchedulesFIELDS2, rentScheduleReconciliationFields, formType: selectedFormType, comparisonData, getComparisonStyle, SalesComparisonSection, EditableField, infoOfSalesFields, loading, stateRequirementFields, handleStateRequirementCheck, stateReqLoading, stateReqResponse, stateReqError, handleUnpaidOkCheck, unpaidOkLoading, unpaidOkResponse, unpaidOkError, handleClientRequirementCheck, clientReqLoading, clientReqResponse, clientReqError, handleFhaCheck, handleADUCheck, fhaLoading, fhaResponse, fhaError, ADULoading, handleEscalationCheck, escalationLoading, escalationResponse, escalationError, onDataChange: handleDataChange, handleExtract, manualValidations, handleManualValidation };

    let formComponent;
    switch (selectedFormType) {
      case '1004':
        formComponent = <Form1004 {...props} allData={data} />;
        break;
      case '1073':
        formComponent = <Form1073 {...props} allData={data} />;
        break;
      case '1007':
        formComponent = <Form1007 {...props} allData={data} />;
        break;
      default:
        return (
          <Typography sx={{ mt: 2, textAlign: 'center' }}>Please select a form type to see the report details.</Typography>
        );
    }
    return (
      <Fade in={!!selectedFormType} timeout={1000}>
        <div>{formComponent}</div>
      </Fade>
    );
  };

  const activeTheme = themeMode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <TooltipStyles />


      <div className="page-container">
        <Sidebar
          sections={getVisibleSections()}
          isOpen={isSidebarOpen || isSidebarLocked}
          isLocked={isSidebarLocked}
          onLockToggle={() => { setIsSidebarLocked(!isSidebarLocked); setIsEditable(!isEditable); }}
          onMouseEnter={() => {
            if (!isSidebarLocked) setIsSidebarOpen(true);
          }}
          onMouseLeave={() => {
            if (!isSidebarLocked) setIsSidebarOpen(false);
          }}
          onSectionClick={handleSectionClick}
          onThemeToggle={handleThemeChange}
          currentTheme={themeMode}
          activeSection={activeSection}
          loadingSection={loadingSection}
          extractedSections={extractedSections}
          visibleSections={visibleSections}
          onArrowClick={handleArrowClick}
          loading={loading}
        />
        <div className={`main-content container-fluid ${isSidebarOpen || isSidebarLocked ? 'sidebar-open' : ''}`}>
          <Box
            className="header-container"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              my: 2,
            }}
          >
            <Box
              component="img"
              src={process.env.PUBLIC_URL + '/logo.png'}
              alt="logo"
              sx={{ height: { xs: 80, md: 100 }, width: 'auto' }}
            />
            <Typography variant="h3" component="h1" className="app-title" sx={{ fontFamily: 'BBH Sans Hegarty', fontWeight: 'bold', fontSize: { xs: '2rem', md: '3rem' } }}>
              FULL FILE REVIEW
            </Typography>
          </Box>



          <Paper
            elevation={2}
            sx={{
              p: 2,
              top: 0,
              zIndex: 1100,
              height: "fit-content",
              backgroundColor: activeTheme.palette.background.paper,
            }}
          >
            <Grid
              container
              spacing={2}
              alignItems="center"



              sx={{ display: "flex", flexWrap: "wrap" }}
            >
              {/* Select File */}
              <Grid item>
                <Tooltip title="Click to upload the main PDF report">
                  <Button variant="outlined" onClick={() => fileInputRef.current.click()}>
                    Select PDF File
                    <input
                      type="file"
                      hidden
                      accept=".pdf,application/pdf"
                      ref={fileInputRef}
                      onChange={onFileChange}
                    />
                  </Button>
                </Tooltip>
                {/* {selectedFile && <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>{selectedFile.name}</Typography>} */}
              </Grid>

              {/* Optional HTML File */}
              <Grid item>
                <Tooltip title="Click to upload an optional HTML file for comparison">
                  <Button variant="outlined" onClick={() => htmlFileInputRef.current.click()}>
                    Upload HTML
                    <input
                      type="file"
                      hidden
                      accept=".html,text/html"
                      ref={htmlFileInputRef}
                      onChange={onHtmlFileChange}
                    />
                  </Button>
                </Tooltip>
                {/* {htmlFile && (
                  <Button variant="contained" onClick={handleReviewHtml} sx={{ ml: 1 }}>
                    Review HTML
                  </Button>
                )} */}



              </Grid>

              {/* Optional Contract Copy */}
              <Grid item>
                <Tooltip title="Click to upload an optional contract copy for comparison">
                  <Button variant="outlined" onClick={() => contractFileInputRef.current.click()}>
                    Contract Copy
                    <input
                      type="file"
                      hidden
                      accept=".pdf,application/pdf,.doc,.docx"
                      ref={contractFileInputRef}
                      onChange={onContractFileChange}
                    />
                  </Button>
                </Tooltip>
                {contractFile && (
                  <Button
                    variant="contained"
                    onClick={() => setIsContractCompareOpen(true)}
                    sx={{ ml: 1 }}
                  >
                    Review Contract
                  </Button>
                )}
                {/* {contractFile && <Typography variant="caption" sx={{ ml: 1 }}>{contractFile.name}</Typography>} */}


              </Grid>

              {/* Optional Engagement Letter */}
              <Grid item>
                <Tooltip title="Click to upload an optional engagement letter for comparison">
                  <Button variant="outlined" onClick={() => engagementLetterFileInputRef.current.click()}>
                    Engagement Letter
                    <input
                      type="file"
                      hidden
                      accept=".pdf,application/pdf,.doc,.docx"
                      ref={engagementLetterFileInputRef}
                      onChange={onEngagementLetterFileChange}
                    />
                  </Button>
                </Tooltip>
              </Grid>

              {/* Form Type Dropdown */}
              <Grid item sx={{ minWidth: 200 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="form-type-select-label">Form Type</InputLabel>
                  <Select
                    labelId="form-type-select-label"
                    id="form-type-select"
                    value={selectedFormType}
                    label="Form Type"
                    onChange={(e) => setSelectedFormType(e.target.value)}
                    className="select"
                  >
                    {formTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Fast App Button */}
              {/* <Grid item>
                <Button

                  variant="outlined"
                  color="primary"
                  onClick={() => setIsComparisonDialogOpen(true)}
                >
                  Fast App
                </Button>
              </Grid> */}
              {/* Generate PDF Button */}
              <Grid item>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleGeneratePdf}
                  disabled={Object.keys(data).length === 0}
                >
                  {isGeneratingPdf ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Generate PDF"
                  )}
                </Button>
              </Grid>
              {/* Generate Error Log Button */}
              <Grid item>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleGenerateErrorLog}
                  disabled={Object.keys(data).length === 0}
                >
                  Generate Error Log
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={2} sx={{ p: 5, position: 'sticky', top: 0, zIndex: 1100, height: 'fit-content', backgroundColor: activeTheme.palette.background.paper }}>
            {selectedFile && (

              <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">

                {/* FILE NAME */}
                <Typography variant="body2" noWrap>
                  Selected File: <strong>{selectedFile.name}</strong>
                </Typography>

                {/* LOADING AREA */}
                {loading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Elapsed: {Math.floor(timer / 60)}m {timer % 60}s
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={extractionProgress}
                      sx={{ width: '100px' }}
                    />
                  </Box>
                )}

                {/* TOTAL TIME TIMER */}
                <Tooltip title={isTimerRunning ? "Click to pause timer" : "Click to start timer"}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', cursor: 'pointer' }}
                    onClick={handleTimerToggle}
                  >
                    Total Time: {Math.floor(fileUploadTimer / 3600).toString().padStart(2, '0')}:
                    {Math.floor((fileUploadTimer % 3600) / 60).toString().padStart(2, '0')}:
                    {(fileUploadTimer % 60).toString().padStart(2, '0')}
                  </Typography>
                </Tooltip>

                {/* LAST EXTRACTION */}
                {!loading && lastExtractionTime && (
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Last extraction: {lastExtractionTime >= 60 ? `${Math.floor(lastExtractionTime / 60)}m ` : ''}
                    {`${(lastExtractionTime % 60).toFixed(1)}s`}
                  </Typography>
                )}

              </Stack>
            )}
            {htmlFile && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="caption">HTML File: {htmlFile.name}</Typography>
                <Button size="small" variant="text" onClick={() => setIsComparisonDialogOpen(true)}>HTML Review</Button>

              </Stack>
            )}
            {contractFile && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="caption">Contract Copy: {contractFile.name}</Typography>
                <Button size="small" variant="text" onClick={() => setIsContractCompareOpen(true)}>Contract Review</Button>
              </Stack>
            )}

            {engagementLetterFile && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="caption">Engagement Letter: {engagementLetterFile.name}</Typography>
                {engagementLetterFile && (
                  <Button
                    variant="text"
                    onClick={() => setIsEngagementLetterDialogOpen(true)}
                    sx={{ ml: 1 }}
                  >
                    Engagement Letter Review
                  </Button>
                )}


              </Stack>)}

          </Paper>

          <Paper elevation={2} sx={{ p: 5, top: 0, zIndex: 1100, height: 'fit-content', backgroundColor: activeTheme.palette.background.paper }} >

            <Grid item xs={12} md={8}>
              {selectedFile && (
                <Stack spacing={1}>
                  {data['From Type'] && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 0.5,
                        width: '100%',
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: 'warning.light',
                        border: '1px solid',
                        borderColor: 'warning.main',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.dark' }}>
                        Please select the correct form type:
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold' }}
                      >
                        Form Type:
                      </Typography>

                      <EditableField
                        fieldPath={['From Type']}
                        value={data['From Type']}
                        onDataChange={handleDataChange}
                        editingField={editingField}
                        setEditingField={setEditingField}
                        isEditable={isEditable}
                        allData={data}
                      />
                      <WarningIcon color="warning" sx={{ marginLeft: '-20px' }} />
                    </Box>

                  )}
                  <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: 'background.default' }}>
                    <Stack spacing={1}>
                      {data['FHA Case No.'] && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                            FHA Case #: {data['FHA Case No.']}
                          </Typography>
                          <Tooltip title="Check FHA Requirements">
                            <IconButton onClick={handleFhaCheck} size="small" sx={{ ml: 0.5 }}>
                              <Info fontSize="small" color="info" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                      {data['ADU File Check'] && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                            ADU File Check: {data['ADU File Check']}
                          </Typography>
                          <Tooltip title="Check 'ADU  Requirements">
                            <IconButton onClick={handleADUCheck} size="small" sx={{ ml: 0.5 }}>
                              <Info fontSize="small" color="info" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                      {data['ANSI'] && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1, flexShrink: 0 }}>
                            ANSI:
                          </Typography>
                          <EditableField fieldPath={['ANSI']} value={data['ANSI']} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={data} />
                        </Box>
                      )}
                      {data['Exposure comment'] && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', mr: 1 }}>
                            Exposure Comment:
                          </Typography>
                          <EditableField fieldPath={['Exposure comment']} value={data['Exposure comment']} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={data} />
                        </Box>
                      )}
                      {data['Prior service comment'] && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', mr: 1 }}>
                            Prior Service Comment:
                          </Typography>
                          <EditableField fieldPath={['Prior service comment']} value={data['Prior service comment']} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={data} />
                        </Box>
                      )}
                      {isUnpaidOkLender && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            Unpaid OK can proceed with review
                          </Typography>
                        </Box>
                      )}
                      {/* {!data['FHA Case No.'] && !data['ANSI'] && !data['Exposure comment'] && !data['Prior service comment'] && !isUnpaidOkLender && ( */}
                      {(!data['FHA Case No.'] || !data['ANSI'] || !data['Exposure comment'] || !data['Prior service comment'] || !isUnpaidOkLender) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, bgcolor: 'error.light' }}>
                          <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.dark' }}>
                            Plz check the report
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                  {(() => {
                    const assignmentType = String(data['Assignment Type'] || '').toLowerCase();
                    return (assignmentType === 'purchase transaction' || assignmentType === 'purchase');
                  })() && !contractExtracted && !loading && (
                      <Dialog open={true} onClose={(event, reason) => { if (reason !== 'backdropClick') setContractExtracted(true); }}>
                        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                          <WarningIcon color="warning" sx={{ mr: 1 }} />
                          Purchase Transaction Alert
                        </DialogTitle>
                        <DialogContent>
                          <Typography>The "Contract" section has not been extracted for this purchase transaction. This is a required step.</Typography>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={() => setContractExtracted(true)}>Dismiss</Button>
                          <Button
                            onClick={() => {
                              handleExtract('CONTRACT');
                              setContractExtracted(true);
                            }}
                            variant="contained"
                          >
                            Extract Contract
                          </Button>
                        </DialogActions>
                      </Dialog>)}
                </Stack>
              )}
            </Grid>
          </Paper>
          <Paper
            elevation={2}
            sx={{
              margin: "0 auto",
              padding: "2px",
              fontSize: "0.85rem",
            }}
          >
            {htmlFile && comparisonData?.comparison_results && (
              <div
                id="html-data-section"
                className="card shadow"
                style={{ fontSize: "0.85rem" }}
              >
                <div className="card-header bg-secondary text-white py-1">
                  <strong style={{ fontSize: "0.9rem" }}>Comparison Result</strong>
                </div>

                <div className="card-body p-2">
                  <ComparisonResultTable
                    result={comparisonData.comparison_results || []}
                  />
                </div>
              </div>
            )}

            {htmlFile && !comparisonData?.comparison_results && (
              <div
                id="html-data-section"
                className="card shadow mb-3"
                style={{ fontSize: "0.85rem" }}
              >
                <GridInfoCard
                  id="html-data-section"
                  title="HTML Data"
                  fields={Object.keys(comparisonData)}
                  data={comparisonData}
                  cardClass="bg-secondary"
                  onDataChange={(field, value) =>
                    handleComparisonDataChange(field[0], value)
                  }
                  editingField={editingField}
                  setEditingField={setEditingField}
                  isEditable={true}
                  allData={data}
                  manualValidations={manualValidations}
                  handleManualValidation={handleManualValidation}
                />
              </div>
            )}
          </Paper>


          <ComparisonDialog
            open={isComparisonDialogOpen}
            onClose={() => setIsComparisonDialogOpen(false)}
            data={{
              comparisonData: comparisonData,
              pdfFile: selectedFile,
              htmlFile: htmlFile,
            }}
            onDataChange={handleComparisonDataChange}
            pdfFile={selectedFile}
            setComparisonData={setComparisonData}
            htmlFile={htmlFile}
          />
          <ContractComparisonDialog
            open={isContractCompareOpen}
            onClose={() => setIsContractCompareOpen(false)}
            onCompare={handleContractCompare}
            loading={contractCompareLoading}
            result={contractCompareResult}
            error={contractCompareError}
            selectedFile={selectedFile}
            contractFile={contractFile}
            mainData={data}
          />
          <EngagementLetterDialog
            open={isEngagementLetterDialogOpen}
            onClose={() => setIsEngagementLetterDialogOpen(false)}
            onCompare={handleEngagementLetterCompare}
            loading={engagementLetterCompareLoading}
            result={engagementLetterCompareResult}
            error={engagementLetterCompareError}
            selectedFile={selectedFile}
            engagementLetterFile={engagementLetterFile}
            mainData={data}
          />


          <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
              {notification.message}
            </Alert>
          </Snackbar>

          {renderForm()}

          <PromptAnalysis
            onPromptSubmit={handlePromptAnalysis}
            loading={promptAnalysisLoading}
            response={promptAnalysisResponse}
            error={promptAnalysisError}
            submittedPrompt={submittedPrompt}
          />

          {rawGemini && (
            <div id="raw-output" className="mt-4">
              <h5>Raw Gemini Output (Debug):</h5>
              <pre style={{ background: '#f8f9fa', padding: '1em', borderRadius: '6px', maxHeight: '300px', overflow: 'auto' }}>{rawGemini}</pre>
            </div>
          )}


        </div>
        {modalContent && (
          <Dialog open={isCheckModalOpen} onClose={() => setIsCheckModalOpen(false)} fullWidth maxWidth="md">
            <DialogTitle>
              {modalContent.title}
              <IconButton
                aria-label="close"
                onClick={() => setIsCheckModalOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <modalContent.Component {...modalContent.props} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsCheckModalOpen(false)}>Close</Button>
              {modalContent.title === 'State Requirement Check' && (
                <Button onClick={() => handleStateRequirementCheck(true)} variant="contained" disabled={stateReqLoading}>
                  {stateReqLoading ? <CircularProgress size={24} /> : 'Reload'}
                </Button>
              )}
              {modalContent.title === 'Client Requirement Check' && (
                <Button onClick={() => handleClientRequirementCheck(true)} variant="contained" disabled={clientReqLoading}>
                  {clientReqLoading ? <CircularProgress size={24} /> : 'Reload'}
                </Button>
              )}
              {modalContent.title === 'Escalation Check' && (
                <Button onClick={() => handleEscalationCheck(true)} variant="contained" disabled={escalationLoading}>
                  {escalationLoading ? <CircularProgress size={24} /> : 'Reload'}
                </Button>
              )}
            </DialogActions>
          </Dialog>
        )}
      </div>
      {showScrollTop && (
        <Fab color="primary" size="small" onClick={scrollTop} sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1200 }}>
          <KeyboardArrowUpIcon />
        </Fab>
      )}
    </ThemeProvider >

  );
}

export default Subject;
  