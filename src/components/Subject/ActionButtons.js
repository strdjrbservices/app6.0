import React from 'react';
import { Button, Stack } from '@mui/material';

const ActionButtons = ({
    handleStateRequirementCheck,
    stateReqLoading,
    handleClientRequirementCheck,
    clientReqLoading,
    handleEscalationCheck,
    escalationLoading,
}) => (
    <Stack direction="row" spacing={2} sx={{ mb: 2, mt: 2 }}>
        <Button variant="contained" onClick={handleStateRequirementCheck} disabled={stateReqLoading} className="blink-me">
            State Req Check
        </Button>
        <Button variant="contained" onClick={handleClientRequirementCheck} disabled={clientReqLoading} className="blink-me">
            Client Req Check
        </Button>
        <Button variant="contained" onClick={handleEscalationCheck} disabled={escalationLoading} color="error">
            Escalation Check
        </Button>
    </Stack>
);

export default ActionButtons;