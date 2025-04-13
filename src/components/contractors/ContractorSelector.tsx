// src/components/contractors/ContractorSelector.tsx
import { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Box
} from '@mui/material';
import contractorService, { Contractor } from '../../services/contractor.service';

interface ContractorSelectorProps {
  value: string | null;
  onChange: (contractorId: string | null) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
}

const ContractorSelector = ({
  value,
  onChange,
  error = false,
  helperText,
  disabled = false,
  required = false,
  label = "General Contractor"
}: ContractorSelectorProps) => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        setLoading(true);
        const response = await contractorService.getContractors();
        setContractors(response.data);
        setFetchError(null);
      } catch (err: any) {
        console.error('Error fetching contractors:', err);
        setFetchError('Failed to load contractors');
      } finally {
        setLoading(false);
      }
    };

    fetchContractors();
  }, []);

  return (
    <FormControl fullWidth error={error} disabled={disabled || loading}>
      <InputLabel required={required}>{label}</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => {
          const newValue = e.target.value === '' ? null : e.target.value;
          onChange(newValue);
        }}
        label={label}
      >
        <MenuItem value="">None</MenuItem>
        {loading ? (
          <MenuItem disabled>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Loading contractors...
            </Box>
          </MenuItem>
        ) : fetchError ? (
          <MenuItem disabled>Error loading contractors</MenuItem>
        ) : contractors.length > 0 ? (
          contractors.map((contractor) => (
            <MenuItem key={contractor.id} value={contractor.id}>
              {contractor.name} ({contractor.code})
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No contractors available</MenuItem>
        )}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
      {fetchError && <FormHelperText error>{fetchError}</FormHelperText>}
    </FormControl>
  );
};

export default ContractorSelector;