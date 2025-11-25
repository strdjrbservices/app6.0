import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    CircularProgress,
    Paper,
    Alert,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
} from '@mui/material';
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

const Form1004D = () => {
    const [oldPdfFile, setOldPdfFile] = useState(null);
    const [htmlFile, setHtmlFile] = useState(null);
    const [newPdfFile, setNewPdfFile] = useState(null);
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [promptText, setPromptText] = useState('');
    const [error, setError] = useState('');
    const [comparisonMode, setComparisonMode] = useState('pdf-vs-pdf');
    const [timer, setTimer] = useState(0);
    const timerRef = useRef(null);

    const PDF_VS_PDF_PROMPT = `1. Please confirm if all sections/fields in the subject section of the 1004D are filled.
2. Compare 'Contract Price' and 'Date of Contract' from the 1004D (new PDF) to the contract section of the Original Appraisal (old PDF).
3. Compare 'Effective Date' and 'Final Value' (as Original Appraised Value) from the 1004D (new PDF) to the 'Effective Date' and 'Final Value' in the Original Appraisal (old PDF).
4. Compare 'Original Appraiser', 'Lender/Client', and 'Address' from the 1004D (new PDF) to the subject section's 'Appraiser', 'Lender/Client Name', and 'Address' of the Original Appraisal (old PDF).
5. In the 1004D PDF, check the "SUMMARY APPRAISAL UPDATE REPORT" section. If it is checked, verify that the question "HAS THE MARKET VALUE OF THE SUBJECT PROPERTY DECLINED SINCE THE EFFECTIVE DATE OF THE PRIOR APPRAISAL?" is answered 'Yes' or 'No'. If 'Yes', a difference value must be present. If 'No', no difference value should be present.
 
Also, if this section is checked, the 'Effective Date' in the signature area must be present. The 'Inspection Date' is optional, but if present, it must be less than or equal to the 'Effective Date'.
 
6. In the 1004D PDF, check the "CERTIFICATION OF COMPLETION" section. If it is checked, verify that the question "HAVE THE IMPROVEMENTS BEEN COMPLETED IN ACCORDANCE WITH THE REQUIREMENTS AND CONDITIONS STATED IN THE ORIGINAL APPRAISAL REPORT?" is answered 'Yes' or 'No'. If 'Yes', the repairs/changes mentioned should match the reconciliation section of the Original Appraisal (old PDF), where the appraisal should be marked "subject to".
 
Also, if this section is checked, the 'Inspection Date' in the signature area must be present. The 'Effective Date' is optional, but if present, it must be greater than or equal to the 'Inspection Date'.
 
 
7. Confirm the presence of a 'Subject street, front view' photo in the 1004D PDF.
8. Confirm the presence of 'E&O and license' details in the 1004D PDF.
9. Confirm the presence of a 'Subject photo addendum' in the 1004D PDF. This is mandatory if the "CERTIFICATION OF COMPLETION" section is checked.

For each item, provide a JSON object in a 'details' array. Each object must have 'sr_no', 'description' (the checklist item), 'original_appraisal_value' (value from old PDF), 'form_1004D_value' (value from new PDF), 'comment' (details of the finding), and 'status' ('Match', 'Mismatch', 'Not Found', or 'Present').`;

    const HTML_VS_PDF_PROMPT = `1. The lender/client's name and lender/client address from the signature section of the 1004d PDF should match the lender/client's name and address in HTML.
2. The inspection date of 1004D should match the inspection date of HTML.
3. The borrower's name and borrower address from HTML should match the subject section and certification section of 1004D.
4. The appraiser's name on the HTML should match with the appraiser's name in 1004d certification section.

For each item, provide a JSON object in a 'details' array. Each object must have 'field' (the checklist item), 'pdf_value' (value from PDF), 'html_value' (value from HTML), 'comment' (details of the finding), and 'status' ('Match', 'Mismatch', 'Not Found', or 'Present').`;

    useEffect(() => {
        if (error) playSound('error');
    }, [error]);

    useEffect(() => {
        if (response) playSound('success');
    }, [response]);

    useEffect(() => {
        if (comparisonMode === 'pdf-vs-pdf') {
            setPromptText(PDF_VS_PDF_PROMPT);
        } else {
            setPromptText(HTML_VS_PDF_PROMPT);
        }
    }, [comparisonMode, PDF_VS_PDF_PROMPT, HTML_VS_PDF_PROMPT]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleFileChange = (setter) => (event) => {
        setter(event.target.files[0]);
        setError('');
        setResponse(null); // Clear previous results
        if (event.target.files[0]) playSound('upload');
    };

    const handleModeChange = (event, newMode) => {
        if (newMode !== null) {
            setComparisonMode(newMode);
            setResponse(null);
            setError('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!promptText.trim()) {
            setError('Please provide a prompt or checklist.');
            return;
        }

        setLoading(true);
        setError('');
        setResponse(null);
        setTimer(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);

        const formData = new FormData();
        let endpoint = '';

        if (comparisonMode === 'pdf-vs-pdf') {
            if (!oldPdfFile || !newPdfFile) {
                setError('Please provide both the Original and New PDF files.');
                setLoading(false);
                return;
            }
            formData.append('old_pdf_file', oldPdfFile);
            formData.append('new_pdf_file', newPdfFile);
            formData.append('revision_request', promptText);
            endpoint = 'https://strdjrbservices1.pythonanywhere.com/api/compare-pdfs/';
        } else { // html-vs-pdf
            if (!htmlFile || !newPdfFile) {
                setError('Please provide both the HTML and New PDF files.');
                setLoading(false);
                return;
            }
            formData.append('html_file', htmlFile);
            formData.append('pdf_file', newPdfFile);
            formData.append('comment', promptText);
            endpoint = 'https://strdjrbservices1.pythonanywhere.com/api/htmlpdf/';
        }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            const rawText = await res.text();

            if (!res.ok) {
                let errorDetail = `HTTP error! status: ${res.status}`;
                try {
                    const errorJson = JSON.parse(rawText);
                    errorDetail = errorJson.detail || errorJson.error || errorDetail;
                } catch (parseError) {
                    errorDetail = rawText || errorDetail;
                }
                throw new Error(errorDetail);
            }
            const result = JSON.parse(rawText);
            setResponse(result);
        } catch (e) {
            const errorMessage = e.message.includes('Failed to fetch') ? 'Could not connect to the server. Please ensure it is running.' : e.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const renderGenericObject = (data) => {
        const rows = [];
        const processObject = (obj, prefix = '') => {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const value = obj[key];
                    const displayName = (prefix ? `${prefix} - ` : '') + key.replace(/_/g, ' ');

                    if (value && typeof value === 'object' && !Array.isArray(value)) {
                        if ('status' in value && 'details' in value) {
                            rows.push({ check: displayName, status: value.status, details: value.details });
                        } else {
                            processObject(value, displayName);
                        }
                    } else {
                        rows.push({ check: displayName, status: 'N/A', details: JSON.stringify(value) });
                    }
                }
            }
        };

        processObject(data);

        if (rows.length === 0) return null;

        return (
            <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
                <Typography variant="h6" gutterBottom>Comparison Results</Typography>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="comparison table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', textTransform: 'capitalize', width: '30%' }}>Check</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', textTransform: 'capitalize', width: '15%' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, index) => (
                                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>{row.check}</TableCell>
                                    <TableCell>{row.status}</TableCell>
                                    <TableCell>{row.details}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        );
    };

    const renderPdfVsPdfResponse = (data) => {
        const details = data?.fields?.details || data?.details;
        if (!details || !Array.isArray(details) || details.length === 0 || !details[0].original_appraisal_value) {
            return renderGenericObject(data); // Fallback for unexpected structure
        }

        return (
            <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
                <Typography variant="h6" gutterBottom>Comparison Results</Typography>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="pdf-vs-pdf comparison table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Sr. No</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Original Appraisal Value</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>1004D Form Value</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {details.map((item, index) => (
                                <TableRow key={item.sr_no || index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>{item.sr_no || 'N/A'}</TableCell>
                                    <TableCell>{item.description || 'N/A'}</TableCell>
                                    <TableCell>{item.original_appraisal_value || 'N/A'}</TableCell>
                                    <TableCell>{item.form_1004D_value || 'N/A'}</TableCell>
                                    <TableCell>{item.comment || 'N/A'}</TableCell>
                                    <TableCell>{item.status || 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        );
    };

    const renderHtmlVsPdfResponse = (data) => {
        if (!data || !data.details || !Array.isArray(data.details) || data.details.length === 0) {
            return renderGenericObject(data); // Fallback for unexpected structure
        }

        const details = data.details;
        const headers = Object.keys(details[0] || {});

        return (
            <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
                <Typography variant="h6" gutterBottom>Comparison Results</Typography>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="html-vs-pdf comparison table">
                        <TableHead>
                            <TableRow>
                                {headers.map(header => (
                                    <TableCell key={header} sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                        {header.replace(/_/g, ' ')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {details.map((item, index) => (
                                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    {headers.map(header => (
                                        <TableCell key={header}>{item[header] || 'N/A'}</TableCell>
                                    ))}
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
            <Typography variant="h5" gutterBottom>1004D Confirmation</Typography>
            <ToggleButtonGroup
                color="primary"
                value={comparisonMode}
                exclusive
                onChange={handleModeChange}
                aria-label="Comparison Mode"
                sx={{ mb: 3 }}
            >
                <ToggleButton value="pdf-vs-pdf">PDF vs. PDF</ToggleButton>
                <ToggleButton value="html-vs-pdf">HTML vs. PDF</ToggleButton>
            </ToggleButtonGroup>
            <form onSubmit={handleSubmit}>
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Upload Files</Typography>
                    <Grid container spacing={3}>
                        {comparisonMode === 'pdf-vs-pdf' && (
                            <>
                                <Grid item xs={12} md={6}>
                                    <Tooltip title="Click to upload the old/original PDF file">
                                        <Button variant="outlined" component="label" fullWidth>
                                            Upload Old/Original PDF
                                            <input type="file" hidden accept=".pdf,application/pdf" onChange={handleFileChange(setOldPdfFile)} />
                                        </Button>
                                    </Tooltip>
                                    {oldPdfFile && <Typography variant="body2" noWrap sx={{ mt: 1 }}>Selected: {oldPdfFile.name}</Typography>}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Tooltip title="Click to upload the 1004D PDF file">
                                        <Button variant="outlined" component="label" fullWidth>Upload 1004D PDF<input type="file" hidden accept=".pdf" onChange={handleFileChange(setNewPdfFile)} /></Button>
                                    </Tooltip>
                                    {newPdfFile && <Typography variant="body2" noWrap sx={{ mt: 1 }}>Selected: {newPdfFile.name}</Typography>}
                                </Grid>
                            </>
                        )}
                        {comparisonMode === 'html-vs-pdf' && (
                            <>
                                <Grid item xs={12} md={6}>
                                    <Tooltip title="Click to upload the HTML file">
                                        <Button variant="outlined" component="label" fullWidth>Upload HTML File<input type="file" hidden accept=".html,text/html" onChange={handleFileChange(setHtmlFile)} /></Button>
                                    </Tooltip>
                                    {htmlFile && <Typography variant="body2" noWrap sx={{ mt: 1 }}>Selected: {htmlFile.name}</Typography>}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Tooltip title="Click to upload the 1004D PDF file">
                                        <Button variant="outlined" component="label" fullWidth>Upload 1004D PDF<input type="file" hidden accept=".pdf" onChange={handleFileChange(setNewPdfFile)} /></Button>
                                    </Tooltip>
                                    {newPdfFile && <Typography variant="body2" noWrap sx={{ mt: 1 }}>Selected: {newPdfFile.name}</Typography>}
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Paper>
                <TextField
                    label="Custom Prompt / Checklist"
                    multiline
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    variant="outlined"
                    fullWidth
                    rows={10}
                    sx={{ mb: 3 }}
                    required
                />
                <Box sx={{ position: 'relative', mt: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading || !newPdfFile || !promptText.trim() || (comparisonMode === 'pdf-vs-pdf' ? !oldPdfFile : !htmlFile)}
                        fullWidth>
                        {loading ? <CircularProgress size={24} /> : 'Run Confirmation Check'}
                    </Button>
                    {loading && <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>Elapsed Time: {Math.floor(timer / 60)}m {timer % 60}s</Typography>}
                </Box>
            </form>
            {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
            {response && comparisonMode === 'pdf-vs-pdf' && renderPdfVsPdfResponse(response)}
            {response && comparisonMode === 'html-vs-pdf' && renderHtmlVsPdfResponse(response)}
        </Paper>
    );
};

export default Form1004D;
