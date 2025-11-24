import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Stack,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  ToggleButton,
  Tooltip,
  ToggleButtonGroup,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import uploadSoundFile from '../../Assets/upload.mp3';
import successSoundFile from '../../Assets/success.mp3';
import errorSoundFile from '../../Assets/error.mp3';

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

// Local EditableField component for the Compare page to avoid dependency on complex validation logic.
const SimpleEditableField = ({ fieldPath, value, onDataChange, editingField, setEditingField, isEditable }) => {
  const isEditing = isEditable && editingField && JSON.stringify(editingField) === JSON.stringify(fieldPath);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setEditingField(null);
    }
  };

  if (isEditing) {
    return (
      <TextField
        value={value || ''}
        onChange={(e) => onDataChange(fieldPath, e.target.value)}
        onBlur={() => setEditingField(null)}
        onKeyDown={handleKeyDown}
        autoFocus
        fullWidth
        size="small"
        variant="standard"
      />
    );
  }

  return (
    <Box onClick={() => isEditable && setEditingField(fieldPath)} sx={{ minHeight: '24px', cursor: isEditable ? 'pointer' : 'default' }}>
      {value}
    </Box>
  );
};

// Helper function to normalize currency values for accurate comparison
const normalizeCurrencyValue = (value) => {
  if (typeof value !== 'string' || value === 'Not Found') {
    return NaN; // Return NaN for non-strings or 'Not Found' to indicate it's not a comparable number
  }
  // Remove currency symbols, commas, and any non-numeric characters except for the decimal point and a leading minus sign
  const cleanedValue = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleanedValue);
};

const CHECKLIST_PROMPT = `Appraisal Report Confirmation Checklist

Please confirm the appraised value has been changed.

Please confirm if the unadjusted value is bracketed with the appraised value.

Please confirm if the adjusted value is bracketed with the appraised value.

Please confirm the Aerial Map, Location Map, UAD Dataset Pages, and 1004MC are present, and that there are no changes from the old report.

Please confirm the GLA, total room count, bath count, and bed count from the Improvements section match the Sales Grid, Photos, and Sketch.

Please confirm if the 1007 form is present in the new report.

Please confirm if the 216,str,rental,operating income form is present in the new report.

For each item in the checklist, provide a 'yes' or 'no' answer in the 'final_output' field. The response should be a JSON object with a 'details' array. Each object in the array should have 'sr_no', 'description', 'old_pdf', 'new_pdf', and 'final_output' keys.
`;


const Compare = () => {
  const [htmlFile, setHtmlFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false); // This can be used for all modes
  const [error, setError] = useState('');
  const [comparisonMode, setComparisonMode] = useState('revision'); // 'revision', 'pdf-html', or 'pdf-pdf'
  const [oldPdfFile, setOldPdfFile] = useState(null);
  const [newPdfFile, setNewPdfFile] = useState(null);
  const [revisionText, setRevisionText] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [oldPdfPageCount, setOldPdfPageCount] = useState(null);
  const [newPdfPageCount, setNewPdfPageCount] = useState(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);


  useEffect(() => {
    // This effect should update comparisonData whenever the response for pdf-html mode changes.
    if (comparisonMode === 'pdf-html' && response && response.comparison_results) {
      setComparisonData(response.comparison_results);
    } else {
      setComparisonData([]);
    }
  }, [response, comparisonMode]); // Keeping comparisonMode ensures data is cleared on mode switch.

  // Logic from ResponsePage for extracting revision text from HTML
  useEffect(() => {
    if (comparisonMode !== 'revision' || !htmlFile) {
      setRevisionText('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');

      let extractedText = '';
      const fieldNameToFind = 'report rejection reason';
      const allElements = doc.body.querySelectorAll('*');

      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        if (element.textContent.trim().toLowerCase().replace(/:$/, '') === fieldNameToFind) {
          let nextElement = element.nextElementSibling;
          if (nextElement) {
            extractedText = nextElement.innerText.trim();
            break;
          }
        }
      }

      setRevisionText(extractedText);
    };
    reader.readAsText(htmlFile);
  }, [htmlFile, comparisonMode]);

  useEffect(() => {
    if (error) {
      playSound('error');
    }
  }, [error]);

  useEffect(() => {
    if (response) {
      playSound('success');
    }
  }, [response]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleOldPdfFileChange = (event) => {
    setOldPdfFile(event.target.files[0]);
    setError('');
    setResponse(null);
    setOldPdfPageCount(null);
    setNewPdfPageCount(null);
  };

  const handleNewPdfFileChange = (event) => {
    setNewPdfFile(event.target.files[0]);
    setError('');
    setResponse(null);
    setOldPdfPageCount(null);
    setNewPdfPageCount(null);
  };

  const handleHtmlFileChange = (event) => {
    setHtmlFile(event.target.files[0]);
    setError('');
    setResponse(null);
    setOldPdfPageCount(null);
    setNewPdfPageCount(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // This function is now primarily triggered by handleModeChange.
    // We can call it with the current comparisonMode.
    await startComparison(comparisonMode);
  };

  const startComparison = async (mode) => {
    setLoading(true);
    setError('');
    setResponse(null);
    setTimer(0); // Reset timer
    if (timerRef.current) { // Clear any existing timer
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => { // Start new timer
      setTimer(prev => prev + 1);
    }, 1000);

    const formData = new FormData();
    let endpoint = '';

    if (mode === 'revision') {
      if (!newPdfFile || !revisionText) {
        setError('Please provide a PDF file and ensure revision text is extracted.');
        setLoading(false);
        return;
      }
      formData.append('file', newPdfFile);
      formData.append('form_type', '1004'); // Or make this selectable
      formData.append('revision_request', revisionText);
      endpoint = 'https://strdjrbservices1.pythonanywhere.com/api/extract/';
    } else if (mode === 'checklist') {
      if (!oldPdfFile || !newPdfFile) {
        setError('Both Old and New PDF files must be provided for this check.');
        setLoading(false);
        return;
      }
      formData.append('old_pdf_file', oldPdfFile);
      formData.append('new_pdf_file', newPdfFile);
      formData.append('revision_request', CHECKLIST_PROMPT);
      endpoint = 'https://strdjrbservices1.pythonanywhere.com/api/compare-pdfs/';
    } else if (mode === 'pdf-html') {
      if (!newPdfFile || !htmlFile) {
        setError('Both PDF and HTML files must be provided for this comparison.');
        setLoading(false);
        return;
      }
      formData.append('pdf_file', newPdfFile);
      formData.append('html_file', htmlFile);
      endpoint = 'https://strdjrbservices1.pythonanywhere.com/api/compare/';
    } else { // 'pdf-pdf'
      if (!oldPdfFile || !newPdfFile) {
        setError('Both Old and New PDF files must be provided for this comparison.');
        setLoading(false);
        return;
      }
      formData.append('old_pdf_file', oldPdfFile);
      formData.append('new_pdf_file', newPdfFile);
      endpoint = 'https://strdjrbservices1.pythonanywhere.com/api/compare-pdfs/';
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      // Defensive parsing: get text first, then parse.
      const rawText = await res.text();

      if (!res.ok) {
        // Try to parse error from text, fallback to status.
        let errorDetail = `HTTP error! status: ${res.status}`;
        try {
          const errorJson = JSON.parse(rawText);
          errorDetail = errorJson.detail || errorDetail;
        } catch (parseError) {
          // If parsing fails, the raw text might be the error message
          errorDetail = rawText || errorDetail;
        }
        throw new Error(errorDetail);
      }

      const result = JSON.parse(rawText);
      if (mode === 'revision') {
        setResponse(result.fields);
      } else if (mode === 'checklist') {
        setResponse(result);
      } else {
        setResponse(result);
      }
      if (comparisonMode === 'pdf-pdf' && result) {
        setOldPdfPageCount(result.old_pdf_page_count);
        setNewPdfPageCount(result.new_pdf_page_count);
      }

    } catch (e) {
      // If the error is a generic network error, show a generic message.
      // Otherwise, show the specific error message from the backend.
      const errorMessage = e.message.includes('Failed to fetch') ? 'Could not connect to the server. Please ensure it is running.' : e.message;
      setError(errorMessage);
      console.error('Comparison failed:', e);
    } finally {
      setLoading(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setComparisonMode(newMode);
      setResponse(null);
      setOldPdfPageCount(null);
      setNewPdfPageCount(null);      
      setRevisionText('');
      // Directly start the comparison process.
      startComparison(newMode);
    }
  };

  // Renders response for PDF-to-PDF comparison
  const renderPdfToPdfResponse = (data) => {
    if (!data) return null;

    const comparisonSummary = data?.comparison_summary || [];
    const summaryText = data?.summary || '';

    // Helper function to safely extract the market value
    const oldMarketValueRaw = data.old_market_value || 'Not Found';
    const newMarketValueRaw = data.new_market_value || 'Not Found';

    // Normalize values for comparison
    const normalizedOldMarketValue = normalizeCurrencyValue(oldMarketValueRaw);
    const normalizedNewMarketValue = normalizeCurrencyValue(newMarketValueRaw);

    // Determine if market values match, considering 'Not Found' as a match if both are 'Not Found'
    const areMarketValuesMatching = (oldMarketValueRaw === 'Not Found' && newMarketValueRaw === 'Not Found') ||
      (!isNaN(normalizedOldMarketValue) && !isNaN(normalizedNewMarketValue) &&
        normalizedOldMarketValue === normalizedNewMarketValue);

    if (comparisonSummary.length === 0) {
      return (
        <Alert severity="success" sx={{ mt: 3 }}>
          No differences were found between the two PDF documents.
        </Alert>
      );
    }

    return (
      <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Verification Results</Typography>
        {summaryText && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderLeft: 5, borderColor: 'primary.main', bgcolor: 'action.hover' }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              {summaryText}
            </Typography>
          </Paper>
        )}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Old PDF Page Count</Typography>
              <Typography variant="h6">{oldPdfPageCount || 'N/A'}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">New PDF Page Count</Typography>
              <Typography variant="h6">{newPdfPageCount || 'N/A'}</Typography>
            </Paper>
          </Grid>
        </Grid>
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: areMarketValuesMatching ? 'success.light' : 'error.light' }}>
          <Typography variant="h6" gutterBottom>Opinion of Market Value Comparison</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography>Old Value: <strong>{oldMarketValueRaw}</strong></Typography>
            <Divider orientation="vertical" flexItem />
            <Typography>New Value: <strong>{newMarketValueRaw}</strong></Typography>
            {areMarketValuesMatching ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
          </Stack>
        </Paper>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="comparison table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Field Changed</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Original Value</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Revised Value</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Page</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonSummary.map((change, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{change.field}</TableCell>
                  <TableCell>{change.original_value}</TableCell>
                  <TableCell>{change.revised_value}</TableCell>
                  <TableCell>{change.comment}</TableCell>
                  <TableCell align="right">{change.page_no}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  // Renders response for Revision Verification
  const renderRevisionResponse = (data) => {
    if (!data) return null;

    const comparisonSummary = data?.comparison_summary || [];
    const summaryText = data?.summary || '';

    if (comparisonSummary.length === 0) {
      return (
        <Alert severity="success" sx={{ mt: 3 }}>
          No differences were found.
        </Alert>
      );
    }

    return (
      <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Verification Results</Typography>
        {summaryText && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderLeft: 5, borderColor: 'primary.main', bgcolor: 'action.hover' }}>
            <Typography variant="h6" gutterBottom component="div" color="text.primary">
              Summary
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              {summaryText}
            </Typography>
          </Paper>
        )}
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="comparison table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Corrected/Not Corrected</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Section</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonSummary.map((change, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{change.status}</TableCell>
                  <TableCell>{change.section}</TableCell>
                  <TableCell>{change.comment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  // Renders response for Confirmation Checklist
  const renderChecklistResponse = (data) => {
    if (!data || !data.details || data.details.length === 0) return null;

    return (
      <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Confirmation Checklist Results</Typography>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="confirmation table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Sr No</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Old PDF</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>New PDF</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Final Output</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.details.map((item, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{item.sr_no}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.old_pdf}</TableCell>
                  <TableCell>{item.new_pdf}</TableCell>
                  <TableCell>{item.final_output}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 4, m: 2 }}>
      {/* <Typography variant="h5" gutterBottom>
        File Comparison
      </Typography>
      <ToggleButtonGroup
        color="primary"
        value={comparisonMode}
        exclusive
        onChange={handleModeChange}
        aria-label="Comparison Mode"
        sx={{ mb: 3 }}
      >
        <ToggleButton value="checklist">Confirmation Checklist</ToggleButton>
        <ToggleButton value="revision">Revision Verification</ToggleButton>
        <ToggleButton value="pdf-html">PDF/HTML</ToggleButton>
        <ToggleButton value="pdf-pdf">PDF/PDF</ToggleButton>
      </ToggleButtonGroup> */}
      <Box
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
          sx={{ height: { xs: 60, md: 80 }, width: 'auto' }}
        />
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
          REVISED FILE REVIEW
        </Typography>
      </Box>



      {/* Unified File Upload Section */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Upload Files</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Tooltip title="Click to upload the old/original PDF file">
              <Button variant="outlined" component="label" fullWidth>
                Upload Old/Original PDF
                <input type="file" hidden accept=".pdf,application/pdf" onChange={handleOldPdfFileChange} />
              </Button>
            </Tooltip>
            {oldPdfFile && <Typography variant="body2" noWrap sx={{ mt: 1 }}>Selected: {oldPdfFile.name}</Typography>}
          </Grid>
          <Grid item xs={12} md={4}>
            <Tooltip title="Click to upload the new/revised PDF file">
              <Button variant="outlined" component="label" fullWidth>
                Upload New/Revised PDF
                <input type="file" hidden accept=".pdf,application/pdf" onChange={handleNewPdfFileChange} />
              </Button>
            </Tooltip>
            {newPdfFile && <Typography variant="body2" noWrap sx={{ mt: 1 }}>Selected: {newPdfFile.name}</Typography>}
          </Grid>
          <Grid item xs={12} md={4}>
            <Tooltip title="Click to upload the HTML file">
              <Button variant="outlined" component="label" fullWidth>
                Upload HTML File
                <input type="file" hidden accept=".html,text/html" onChange={handleHtmlFileChange} />
              </Button>
            </Tooltip>
            {htmlFile && <Typography variant="body2" noWrap sx={{ mt: 1 }}>Selected: {htmlFile.name}</Typography>}
          </Grid>
        </Grid>
      </Paper>

      <ToggleButtonGroup
        color="primary"
        value={comparisonMode}
        exclusive
        onChange={handleModeChange}
        aria-label="Comparison Mode"
        sx={{ mb: 3 }}
      >
        <ToggleButton value="revision">Revision Verification</ToggleButton>
        <ToggleButton value="checklist">Confirmation Checklist</ToggleButton>
        <ToggleButton value="pdf-html">PDF/HTML</ToggleButton>
        <ToggleButton value="pdf-pdf">PDF/PDF</ToggleButton>
      </ToggleButtonGroup>

      <form onSubmit={handleSubmit}>
        {comparisonMode === 'revision' && (
          <>
            <TextField
              label="Extracted Revision Request"
              multiline
              rows={6}
              value={revisionText}
              onChange={(e) => setRevisionText(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{ mb: 3 }}
            />
          </>
        )}
        {/* The file upload sections for each mode are now removed, as they are handled by the unified uploader */}
        {comparisonMode === 'pdf-html' && ( <Box mt={2} /> )}
        {comparisonMode === 'pdf-pdf' && ( <Box mt={2} /> )}
        {comparisonMode === 'checklist' && ( <Box mt={2} /> )}

        <Box sx={{ mt: 2 }}>
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={loading}
            disabled={
              (comparisonMode === 'revision' && (!newPdfFile || !revisionText)) ||
              (comparisonMode === 'pdf-html' && (!newPdfFile || !htmlFile)) ||
              (comparisonMode === 'pdf-pdf' && (!oldPdfFile || !newPdfFile)) ||
              (comparisonMode === 'checklist' && (!oldPdfFile || !newPdfFile))
            }
            fullWidth
          >
            {comparisonMode === 'revision' ? 'Verify Revisions' : (comparisonMode === 'checklist' ? 'Run Confirmation Check' : 'Compare')}
          </LoadingButton>
          {loading && <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>Elapsed Time: {Math.floor(timer / 60)}m {timer % 60}s</Typography>}
        </Box>
      </form>

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
      {response && comparisonMode === 'revision' && renderRevisionResponse(response)}
      {response && comparisonMode === 'checklist' && renderChecklistResponse(response)}
      {response && comparisonMode === 'pdf-pdf' && renderPdfToPdfResponse(response)}

      {response && comparisonMode === 'pdf-html' && (
        <>
          {response.comparison_results && (
            <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>Comparison Result</Typography>
              {response.comparison_results.length > 0 ? (
                <TableContainer>
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
                      {comparisonData.map((item, index) => {
                        // Ensure we are working with strings, defaulting null/undefined to empty string.
                        const htmlValue = (item.html_value === null || item.html_value === undefined) ? '' : String(item.html_value);
                        const pdfValue = (item.pdf_value === null || item.pdf_value === undefined) ? '' : String(item.pdf_value);

                        // Start with the status from the backend.
                        let isMatch = item.status === 'Match';

                        // Normalize strings for robust comparison.
                        const normalize = (str) => {
                          if (typeof str !== 'string') {
                            return '';
                          }

                          let normalizedStr = str.toLowerCase();

                          // 1. Unicode normalization (e.g., to handle accented characters)
                          // Convert to NFD (Canonical Decomposition) and remove diacritics
                          normalizedStr = normalizedStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                          // 2. Replace common address abbreviations using word boundaries
                          const abbreviations = {
                            'ave': 'avenue', 'st': 'street', 'rd': 'road', 'dr': 'drive',
                            'blvd': 'boulevard', 'ln': 'lane', 'pl': 'place',
                            'cir': 'circle', 'pkwy': 'parkway', 'ter': 'terrace',
                            // State abbreviations
                            'al': 'alabama', 'ak': 'alaska', 'az': 'arizona', 'ar': 'arkansas', 'ca': 'california',
                            'co': 'colorado', 'ct': 'connecticut', 'de': 'delaware', 'fl': 'florida', 'ga': 'georgia',
                            'hi': 'hawaii', 'id': 'idaho', 'il': 'illinois', 'in': 'indiana', 'ia': 'iowa',
                            'ks': 'kansas', 'ky': 'kentucky', 'la': 'louisiana', 'me': 'maine', 'md': 'maryland',
                            'ma': 'massachusetts', 'mi': 'michigan', 'mn': 'minnesota', 'ms': 'mississippi',
                            'mo': 'missouri', 'mt': 'montana', 'ne': 'nebraska', 'nv': 'nevada', 'nh': 'newhampshire',
                            'nj': 'newjersey', 'nm': 'newmexico', 'ny': 'newyork', 'nc': 'northcarolina',
                            'nd': 'northdakota', 'oh': 'ohio', 'ok': 'oklahoma', 'or': 'oregon', 'pa': 'pennsylvania',
                            'ri': 'rhodeisland', 'sc': 'southcarolina', 'sd': 'southdakota', 'tn': 'tennessee',
                            'tx': 'texas', 'ut': 'utah', 'vt': 'vermont', 'va': 'virginia', 'wa': 'washington',
                            'wv': 'westvirginia', 'wi': 'wisconsin', 'wy': 'wyoming',
                            // Other common terms
                            'apt': 'apartment', 'bldg': 'building', 'dept': 'department',
                            'ste': 'suite', 'unit': 'unit'
                          };
                          // Replace abbreviations using word boundaries to avoid replacing parts of words
                          for (const [abbr, full] of Object.entries(abbreviations)) {
                            normalizedStr = normalizedStr.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
                          }
                          // Remove all spaces and non-alphanumeric characters
                          return normalizedStr.replace(/[\s\W_]/g, '');
                        };

                        const normalizedHtml = normalize(htmlValue);
                        const normalizedPdf = normalize(pdfValue);

                        if (item.field === 'Property Address') {
                          // Special check for Property Address: match if the first word/number is the same.
                          const getFirstWord = (str) => (str || '').toLowerCase().replace(/[^\w\s]/g, '').trim().split(/\s+/)[0] || '';
                          const htmlFirstWord = getFirstWord(htmlValue);
                          const pdfFirstWord = getFirstWord(pdfValue);
                          // Match if both have a first word and they are identical.
                          isMatch = htmlFirstWord && pdfFirstWord && htmlFirstWord === pdfFirstWord;
                        } else {
                          // For other fields, check for an exact match or if one contains the other.
                          isMatch = normalizedHtml === normalizedPdf || normalizedHtml.includes(normalizedPdf) || normalizedPdf.includes(normalizedHtml);
                        }

                        const handleDataChange = (path, newValue) => {
                          setComparisonData(prevData => {
                            const newData = [...prevData];
                            newData[path[0]][path[1]] = newValue;
                            return newData;
                          });
                        };

                        return (
                          <TableRow key={index} hover>
                            <TableCell><SimpleEditableField fieldPath={[index, 'field']} value={item.field} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={true} /></TableCell>
                            <TableCell><SimpleEditableField fieldPath={[index, 'html_value']} value={item.html_value} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={true} /></TableCell>
                            <TableCell><SimpleEditableField fieldPath={[index, 'pdf_value']} value={item.pdf_value} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={true} /></TableCell>
                            <TableCell align="center">
                              {isMatch ? (
                                <Chip icon={<CheckCircleIcon />} label="Match" color="success" size="small" />
                              ) : (
                                <Chip icon={<CancelIcon />} label="Mismatch" color="error" size="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="success" sx={{ mt: 2 }}>
                  No differences found between the two documents.
                </Alert>
              )}
            </Paper>)}
        </>
      )}
      {/* {response && !response.comparison_results && (
        <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom>Comparison Result</Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            The comparison result was not in the expected format. Raw response:
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </Alert>
        </Paper>
      )} */}
    </Paper>
  );
};

export default Compare;
