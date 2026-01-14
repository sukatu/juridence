import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Search, Download } from 'lucide-react';
import AdminHeader from './AdminHeader';
import { apiGet, apiPost, apiPut } from '../../utils/api';
import { showSuccess, handleApiError, validateRequired } from '../../utils/errorHandler';
import * as XLSX from 'xlsx';

const UploadGazetteForm = ({ onBack, userInfo, onNavigate, onLogout, editMode = false, initialGazette = null }) => {
  const [uploadType, setUploadType] = useState('manual');
  const [entityType, setEntityType] = useState('individual');
  const [hasUploadedFiles, setHasUploadedFiles] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedEntries, setParsedEntries] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ total: 0, processed: 0, success: 0, failed: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const fileInputRef = useRef(null);
  const [noticeType, setNoticeType] = useState('');
  const [showNoticeTypeDropdown, setShowNoticeTypeDropdown] = useState(false);
  const noticeTypeDropdownRef = useRef(null);
  
  // Person selection state
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personSearchQuery, setPersonSearchQuery] = useState('');
  const [personSearchResults, setPersonSearchResults] = useState([]);
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const [isSearchingPerson, setIsSearchingPerson] = useState(false);
  const personDropdownRef = useRef(null);
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});
  
  // Form data for Change of Name
  const [formData, setFormData] = useState({
    currentName: '',
    oldName: '',
    aliasNames: [],
    profession: '',
    address: '',
    effectiveDateOfChange: '',
    remarks: '',
    source: {
      gazetteNumber: '',
      gazetteDate: '',
      itemNo: '',
      pageNo: ''
    }
  });
  const [newAliasName, setNewAliasName] = useState('');

  // Form data for Change of Date of Birth
  const [dobFormData, setDobFormData] = useState({
    name: '',
    newDate: '',
    oldDate: '',
    profession: '',
    address: '',
    effectiveDateOfChange: '',
    remarks: '',
    source: {
      gazetteNumber: '',
      gazetteDate: '',
      itemNo: '',
      pageNo: ''
    }
  });

  // Form data for Change of Place of Birth
  const [pobFormData, setPobFormData] = useState({
    name: '',
    mistakePlace: '',
    correctPlace: '',
    profession: '',
    address: '',
    effectiveDateOfChange: '',
    remarks: '',
    source: {
      gazetteNumber: '',
      gazetteDate: '',
      itemNo: '',
      pageNo: ''
    }
  });

  const noticeTypes = [
    'Change of name',
    'Date of birth correction',
    'Place of birth correction',
    'Marriage officer appointment',
    'Company name change',
    'Address change'
  ];

  // Map notice types to backend gazette types
  const mapNoticeTypeToGazetteType = (noticeType) => {
    const mapping = {
      'Change of name': 'CHANGE_OF_NAME',
      'Date of birth correction': 'CHANGE_OF_DATE_OF_BIRTH',
      'Place of birth correction': 'CHANGE_OF_PLACE_OF_BIRTH',
      'Marriage officer appointment': 'APPOINTMENT_OF_MARRIAGE_OFFICERS',
      'Company name change': 'LEGAL_NOTICE',
      'Address change': 'PERSONAL_NOTICE'
    };
    return mapping[noticeType] || 'OTHER';
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return '';
    }
  };

  // Parse date from input field (YYYY-MM-DD) to ISO format
  const parseDateInput = (dateString) => {
    if (!dateString || !dateString.trim()) return null;
    try {
      const date = new Date(dateString + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  // Download CSV Template
  const downloadCSVTemplate = () => {
    // Define template headers with descriptions in first row
    const headers = [
      'Notice Type *',
      'Gazette Number',
      'Gazette Date (YYYY-MM-DD)',
      'Item Number',
      'Page Number',
      'Current/New Name *',
      'Old Name',
      'Alias Names (separate with semicolon)',
      'Old Date of Birth (YYYY-MM-DD)',
      'New Date of Birth (YYYY-MM-DD)',
      'Old Place of Birth',
      'New Place of Birth',
      'Profession',
      'Address',
      'Effective Date of Change (YYYY-MM-DD)',
      'Remarks',
      'Description',
      'Reference Number'
    ];

    // Create sample data rows for different notice types
    const sampleRows = [
      // Change of Name example
      [
        'Change of name',
        'CV/1089/2021',
        '2024-01-15',
        '123',
        '45',
        'John Doe',
        'John Smith',
        'Johnny; J. Doe',
        '',
        '',
        '',
        '',
        'Engineer',
        'Accra, Ghana',
        '2024-01-01',
        'Name change approved',
        'Change of name from John Smith to John Doe',
        'REF-001'
      ],
      // Date of Birth Correction example
      [
        'Date of birth correction',
        'CV/1090/2021',
        '2024-02-01',
        '124',
        '46',
        'Jane Doe',
        '',
        '',
        '1990-05-15',
        '1990-05-20',
        '',
        '',
        'Doctor',
        'Kumasi, Ghana',
        '2024-02-01',
        'DOB correction',
        'Date of birth correction notice',
        'REF-002'
      ],
      // Place of Birth Correction example
      [
        'Place of birth correction',
        'CV/1091/2021',
        '2024-03-01',
        '125',
        '47',
        'Mary Johnson',
        '',
        '',
        '',
        '',
        'Kumasi',
        'Accra',
        'Teacher',
        'Tamale, Ghana',
        '2024-03-01',
        'POB correction',
        'Place of birth correction notice',
        'REF-003'
      ]
    ];

    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add sample rows
    sampleRows.forEach(row => {
      const escapedRow = row.map(cell => {
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell || '';
      });
      csvContent += escapedRow.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'gazette_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Map notice type string to backend enum
  const mapNoticeTypeToBackend = (noticeType) => {
    const mapping = {
      'Change of name': 'CHANGE_OF_NAME',
      'Date of birth correction': 'CHANGE_OF_DATE_OF_BIRTH',
      'Place of birth correction': 'CHANGE_OF_PLACE_OF_BIRTH',
      'Marriage officer appointment': 'APPOINTMENT_OF_MARRIAGE_OFFICERS',
      'Company name change': 'LEGAL_NOTICE',
      'Address change': 'PERSONAL_NOTICE'
    };
    return mapping[noticeType] || null;
  };

  // Parse CSV file
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let currentValue = '';
      let inQuotes = false;

      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          if (inQuotes && lines[i][j + 1] === '"') {
            currentValue += '"';
            j++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());

      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return data;
  };

  // Parse Excel file
  const parseExcel = async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
    return jsonData;
  };

  // Map parsed data to gazette format
  const mapRowToGazetteEntry = (row) => {
    const noticeType = row['Notice Type *'] || row['Notice Type'] || '';
    const gazetteType = mapNoticeTypeToBackend(noticeType);

    if (!gazetteType) {
      return { error: `Invalid notice type: ${noticeType}` };
    }

    const entry = {
      noticeType: noticeType,
      gazetteType: gazetteType,
      gazetteNumber: row['Gazette Number'] || '',
      gazetteDate: row['Gazette Date (YYYY-MM-DD)'] || row['Gazette Date'] || '',
      itemNumber: row['Item Number'] || '',
      pageNumber: row['Page Number'] || '',
      currentName: row['Current/New Name *'] || row['Current/New Name'] || '',
      oldName: row['Old Name'] || '',
      aliasNames: (row['Alias Names (separate with semicolon)'] || row['Alias Names'] || '')
        .split(';')
        .map(n => n.trim())
        .filter(n => n),
      oldDateOfBirth: row['Old Date of Birth (YYYY-MM-DD)'] || row['Old Date of Birth'] || '',
      newDateOfBirth: row['New Date of Birth (YYYY-MM-DD)'] || row['New Date of Birth'] || '',
      oldPlaceOfBirth: row['Old Place of Birth'] || '',
      newPlaceOfBirth: row['New Place of Birth'] || '',
      profession: row['Profession'] || '',
      address: row['Address'] || '',
      effectiveDateOfChange: row['Effective Date of Change (YYYY-MM-DD)'] || row['Effective Date of Change'] || '',
      remarks: row['Remarks'] || '',
      description: row['Description'] || '',
      referenceNumber: row['Reference Number'] || ''
    };

    // Validate required fields
    const errors = [];
    if (!entry.currentName) {
      errors.push('Current/New Name is required');
    }

    if (gazetteType === 'CHANGE_OF_NAME' && !entry.oldName) {
      errors.push('Old Name is required for Change of Name');
    }

    if (gazetteType === 'CHANGE_OF_DATE_OF_BIRTH' && !entry.newDateOfBirth) {
      errors.push('New Date of Birth is required for Date of Birth Correction');
    }

    if (gazetteType === 'CHANGE_OF_PLACE_OF_BIRTH' && (!entry.oldPlaceOfBirth || !entry.newPlaceOfBirth)) {
      errors.push('Old Place of Birth and New Place of Birth are required for Place of Birth Correction');
    }

    if (errors.length > 0) {
      entry.error = errors.join('; ');
    }

    return entry;
  };

  // Handle file selection
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      alert('Please select a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    
    try {
      let parsedData = [];
      
      if (fileExtension === '.csv') {
        const text = await file.text();
        parsedData = parseCSV(text);
      } else {
        parsedData = await parseExcel(file);
      }

      if (parsedData.length === 0) {
        alert('File is empty or could not be parsed');
        setUploadedFile(null);
        return;
      }

      // Map parsed data to entries
      const entries = parsedData.map((row, index) => {
        const entry = mapRowToGazetteEntry(row);
        return {
          ...entry,
          rowNumber: index + 2, // +2 because row 1 is header, and arrays are 0-indexed
          uploadDate: new Date().toLocaleDateString('en-GB'),
          uploadTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          uploadedBy: userInfo?.full_name || userInfo?.username || 'User',
          status: entry.error ? 'With error' : 'Valid',
          statusColor: entry.error ? 'red' : 'green'
        };
      });

      setParsedEntries(entries);
      setHasUploadedFiles(true);
      setUploadErrors(entries.filter(e => e.error).map(e => `Row ${e.rowNumber}: ${e.error}`));
      
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file: ' + error.message);
      setUploadedFile(null);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle bulk upload submission
  const handleBulkUpload = async () => {
    if (parsedEntries.length === 0) {
      handleApiError({ message: 'No entries to upload' }, 'upload gazettes');
      return;
    }

    // Filter out entries with errors
    const validEntries = parsedEntries.filter(e => !e.error);
    
    if (validEntries.length === 0) {
      handleApiError({ message: 'No valid entries to upload. Please fix the errors first.' }, 'upload gazettes');
      return;
    }

    setIsUploading(true);
    setUploadProgress({ total: validEntries.length, processed: 0, success: 0, failed: 0 });

    const errors = [];
    let successCount = 0;

    try {
      // Upload entries one by one (or group by type for batch upload)
      for (let i = 0; i < validEntries.length; i++) {
        const entry = validEntries[i];
        
        try {
          // Build gazette data
          const gazetteData = {
            gazette_type: entry.gazetteType,
            title: '',
            content: '',
            publication_date: entry.gazetteDate ? new Date(entry.gazetteDate).toISOString() : new Date().toISOString(),
            status: 'DRAFT',
            priority: 'MEDIUM',
            is_public: true,
            is_featured: false
          };

          // Fill data based on notice type
          if (entry.gazetteType === 'CHANGE_OF_NAME') {
            gazetteData.title = `Change of Name - ${entry.currentName}`;
            gazetteData.content = `Change of name from ${entry.oldName} to ${entry.currentName}`;
            gazetteData.new_name = entry.currentName;
            gazetteData.old_name = entry.oldName;
            gazetteData.alias_names = entry.aliasNames;
            gazetteData.profession = entry.profession;
            gazetteData.effective_date_of_change = entry.effectiveDateOfChange ? new Date(entry.effectiveDateOfChange + 'T00:00:00').toISOString() : null;
            gazetteData.remarks = entry.remarks;
            gazetteData.item_number = entry.itemNumber;
            gazetteData.gazette_number = entry.gazetteNumber;
            gazetteData.gazette_date = entry.gazetteDate ? new Date(entry.gazetteDate + 'T00:00:00').toISOString() : null;
            gazetteData.gazette_page = entry.pageNumber ? parseInt(entry.pageNumber, 10) : null;
          } else if (entry.gazetteType === 'CHANGE_OF_DATE_OF_BIRTH') {
            gazetteData.title = `Date of Birth Correction - ${entry.currentName}`;
            gazetteData.content = `Date of birth correction from ${entry.oldDateOfBirth} to ${entry.newDateOfBirth}`;
            gazetteData.old_date_of_birth = entry.oldDateOfBirth ? new Date(entry.oldDateOfBirth + 'T00:00:00').toISOString() : null;
            gazetteData.new_date_of_birth = entry.newDateOfBirth ? new Date(entry.newDateOfBirth + 'T00:00:00').toISOString() : null;
            gazetteData.profession = entry.profession;
            gazetteData.effective_date_of_change = entry.effectiveDateOfChange ? new Date(entry.effectiveDateOfChange + 'T00:00:00').toISOString() : null;
            gazetteData.remarks = entry.remarks;
            gazetteData.item_number = entry.itemNumber;
            gazetteData.gazette_number = entry.gazetteNumber;
            gazetteData.gazette_date = entry.gazetteDate ? new Date(entry.gazetteDate + 'T00:00:00').toISOString() : null;
            gazetteData.gazette_page = entry.pageNumber ? parseInt(entry.pageNumber, 10) : null;
          } else if (entry.gazetteType === 'CHANGE_OF_PLACE_OF_BIRTH') {
            gazetteData.title = `Place of Birth Correction - ${entry.currentName}`;
            gazetteData.content = `Place of birth correction from ${entry.oldPlaceOfBirth} to ${entry.newPlaceOfBirth}`;
            gazetteData.old_place_of_birth = entry.oldPlaceOfBirth;
            gazetteData.new_place_of_birth = entry.newPlaceOfBirth;
            gazetteData.profession = entry.profession;
            gazetteData.effective_date_of_change = entry.effectiveDateOfChange ? new Date(entry.effectiveDateOfChange + 'T00:00:00').toISOString() : null;
            gazetteData.remarks = entry.remarks;
            gazetteData.item_number = entry.itemNumber;
            gazetteData.gazette_number = entry.gazetteNumber;
            gazetteData.gazette_date = entry.gazetteDate ? new Date(entry.gazetteDate + 'T00:00:00').toISOString() : null;
            gazetteData.gazette_page = entry.pageNumber ? parseInt(entry.pageNumber, 10) : null;
          }

          if (entry.description) gazetteData.description = entry.description;
          if (entry.referenceNumber) gazetteData.reference_number = entry.referenceNumber;

          // Create gazette entry
          await apiPost('/gazette', gazetteData);
          successCount++;
          setUploadProgress(prev => ({ ...prev, success: prev.success + 1 }));

        } catch (error) {
          console.error(`Error uploading row ${entry.rowNumber}:`, error);
          const errorMsg = error?.detail || error?.message || 'Upload failed';
          errors.push(`Row ${entry.rowNumber}: ${errorMsg}`);
          setUploadProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
        }

        setUploadProgress(prev => ({
          ...prev,
          processed: i + 1
        }));
      }

      // Show results
      if (errors.length === 0) {
        showSuccess(`Successfully uploaded ${successCount} gazette entries!`);
        // Reset form
        setParsedEntries([]);
        setUploadedFile(null);
        setHasUploadedFiles(false);
        setUploadProgress({ total: 0, processed: 0, success: 0, failed: 0 });
        setUploadErrors([]);
      } else {
        const message = `Upload completed with errors:\n\nSuccess: ${successCount}\nFailed: ${errors.length}`;
        handleApiError({ message }, 'bulk upload');
        setUploadErrors(errors);
      }

    } catch (error) {
      console.error('Error during bulk upload:', error);
      handleApiError(error, 'bulk upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Download Excel Template
  const downloadExcelTemplate = () => {
    // Define template headers
    const headers = [
      'Notice Type *',
      'Gazette Number',
      'Gazette Date (YYYY-MM-DD)',
      'Item Number',
      'Page Number',
      'Current/New Name *',
      'Old Name',
      'Alias Names (separate with semicolon)',
      'Old Date of Birth (YYYY-MM-DD)',
      'New Date of Birth (YYYY-MM-DD)',
      'Old Place of Birth',
      'New Place of Birth',
      'Profession',
      'Address',
      'Effective Date of Change (YYYY-MM-DD)',
      'Remarks',
      'Description',
      'Reference Number'
    ];

    // Create sample data rows
    const sampleData = [
      // Change of Name example
      {
        'Notice Type *': 'Change of name',
        'Gazette Number': 'CV/1089/2021',
        'Gazette Date (YYYY-MM-DD)': '2024-01-15',
        'Item Number': '123',
        'Page Number': '45',
        'Current/New Name *': 'John Doe',
        'Old Name': 'John Smith',
        'Alias Names (separate with semicolon)': 'Johnny; J. Doe',
        'Old Date of Birth (YYYY-MM-DD)': '',
        'New Date of Birth (YYYY-MM-DD)': '',
        'Old Place of Birth': '',
        'New Place of Birth': '',
        'Profession': 'Engineer',
        'Address': 'Accra, Ghana',
        'Effective Date of Change (YYYY-MM-DD)': '2024-01-01',
        'Remarks': 'Name change approved',
        'Description': 'Change of name from John Smith to John Doe',
        'Reference Number': 'REF-001'
      },
      // Date of Birth Correction example
      {
        'Notice Type *': 'Date of birth correction',
        'Gazette Number': 'CV/1090/2021',
        'Gazette Date (YYYY-MM-DD)': '2024-02-01',
        'Item Number': '124',
        'Page Number': '46',
        'Current/New Name *': 'Jane Doe',
        'Old Name': '',
        'Alias Names (separate with semicolon)': '',
        'Old Date of Birth (YYYY-MM-DD)': '1990-05-15',
        'New Date of Birth (YYYY-MM-DD)': '1990-05-20',
        'Old Place of Birth': '',
        'New Place of Birth': '',
        'Profession': 'Doctor',
        'Address': 'Kumasi, Ghana',
        'Effective Date of Change (YYYY-MM-DD)': '2024-02-01',
        'Remarks': 'DOB correction',
        'Description': 'Date of birth correction notice',
        'Reference Number': 'REF-002'
      },
      // Place of Birth Correction example
      {
        'Notice Type *': 'Place of birth correction',
        'Gazette Number': 'CV/1091/2021',
        'Gazette Date (YYYY-MM-DD)': '2024-03-01',
        'Item Number': '125',
        'Page Number': '47',
        'Current/New Name *': 'Mary Johnson',
        'Old Name': '',
        'Alias Names (separate with semicolon)': '',
        'Old Date of Birth (YYYY-MM-DD)': '',
        'New Date of Birth (YYYY-MM-DD)': '',
        'Old Place of Birth': 'Kumasi',
        'New Place of Birth': 'Accra',
        'Profession': 'Teacher',
        'Address': 'Tamale, Ghana',
        'Effective Date of Change (YYYY-MM-DD)': '2024-03-01',
        'Remarks': 'POB correction',
        'Description': 'Place of birth correction notice',
        'Reference Number': 'REF-003'
      }
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    // Set column widths
    const columnWidths = [
      { wch: 25 }, // Notice Type
      { wch: 15 }, // Gazette Number
      { wch: 20 }, // Gazette Date
      { wch: 12 }, // Item Number
      { wch: 12 }, // Page Number
      { wch: 20 }, // Current/New Name
      { wch: 20 }, // Old Name
      { wch: 35 }, // Alias Names
      { wch: 20 }, // Old Date of Birth
      { wch: 20 }, // New Date of Birth
      { wch: 18 }, // Old Place of Birth
      { wch: 18 }, // New Place of Birth
      { wch: 15 }, // Profession
      { wch: 25 }, // Address
      { wch: 25 }, // Effective Date of Change
      { wch: 25 }, // Remarks
      { wch: 40 }, // Description
      { wch: 15 }  // Reference Number
    ];
    ws['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Gazette Template');
    
    // Write and download
    XLSX.writeFile(wb, 'gazette_upload_template.xlsx');
  };

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    if (!selectedPerson) {
      errors.person = 'Please select a person';
    }
    
    if (!noticeType) {
      errors.noticeType = 'Please select a notice type';
    }
    
    if (noticeType === 'Change of name') {
      if (!formData.currentName || !formData.currentName.trim()) {
        errors.currentName = 'Current name is required';
      }
      if (!formData.oldName || !formData.oldName.trim()) {
        errors.oldName = 'Old name is required';
      }
      if (formData.source.gazetteNumber && !formData.source.gazetteNumber.trim()) {
        errors.gazetteNumber = 'Gazette number is required if provided';
      }
      if (formData.source.gazetteDate) {
        const parsed = parseDateInput(formData.source.gazetteDate);
        if (!parsed) {
          errors.gazetteDate = 'Invalid gazette date';
        }
      }
      if (formData.effectiveDateOfChange) {
        const parsed = parseDateInput(formData.effectiveDateOfChange);
        if (!parsed) {
          errors.effectiveDateOfChange = 'Invalid effective date';
        }
      }
    }
    
    if (noticeType === 'Date of birth correction') {
      if (!dobFormData.name || !dobFormData.name.trim()) {
        errors.name = 'Name is required';
      }
      if (!dobFormData.newDate) {
        errors.newDate = 'New date of birth is required';
      } else {
        const parsed = parseDateInput(dobFormData.newDate);
        if (!parsed) {
          errors.newDate = 'Invalid new date of birth';
        }
      }
      if (!dobFormData.oldDate) {
        errors.oldDate = 'Old date of birth is required';
      } else {
        const parsed = parseDateInput(dobFormData.oldDate);
        if (!parsed) {
          errors.oldDate = 'Invalid old date of birth';
        }
      }
      if (dobFormData.source.gazetteDate) {
        const parsed = parseDateInput(dobFormData.source.gazetteDate);
        if (!parsed) {
          errors.dobGazetteDate = 'Invalid gazette date';
        }
      }
      if (dobFormData.effectiveDateOfChange) {
        const parsed = parseDateInput(dobFormData.effectiveDateOfChange);
        if (!parsed) {
          errors.dobEffectiveDateOfChange = 'Invalid effective date';
        }
      }
    }
    
    if (noticeType === 'Place of birth correction') {
      if (!pobFormData.name || !pobFormData.name.trim()) {
        errors.pobName = 'Name is required';
      }
      if (!pobFormData.mistakePlace || !pobFormData.mistakePlace.trim()) {
        errors.mistakePlace = 'Mistake place is required';
      }
      if (!pobFormData.correctPlace || !pobFormData.correctPlace.trim()) {
        errors.correctPlace = 'Correct place is required';
      }
      if (pobFormData.source.gazetteDate) {
        const parsed = parseDateInput(pobFormData.source.gazetteDate);
        if (!parsed) {
          errors.pobGazetteDate = 'Invalid gazette date';
        }
      }
      if (pobFormData.effectiveDateOfChange) {
        const parsed = parseDateInput(pobFormData.effectiveDateOfChange);
        if (!parsed) {
          errors.pobEffectiveDateOfChange = 'Invalid effective date';
        }
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Search for people
  useEffect(() => {
    const searchPeople = async () => {
      if (!personSearchQuery || personSearchQuery.trim().length < 2) {
        setPersonSearchResults([]);
        return;
      }

      try {
        setIsSearchingPerson(true);
        const params = new URLSearchParams({
          query: personSearchQuery.trim(),
          limit: '10',
          page: '1'
        });
        const response = await apiGet(`/people/search?${params.toString()}`);
        if (response && response.people) {
          setPersonSearchResults(response.people);
          setShowPersonDropdown(true);
        } else {
          setPersonSearchResults([]);
        }
      } catch (err) {
        console.error('Error searching people:', err);
        setPersonSearchResults([]);
      } finally {
        setIsSearchingPerson(false);
      }
    };

    const timer = setTimeout(() => searchPeople(), 300);
    return () => clearTimeout(timer);
  }, [personSearchQuery]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (noticeTypeDropdownRef.current && !noticeTypeDropdownRef.current.contains(event.target)) {
        setShowNoticeTypeDropdown(false);
      }
      if (personDropdownRef.current && !personDropdownRef.current.contains(event.target)) {
        setShowPersonDropdown(false);
      }
    };

      document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle person selection
  const selectPerson = (person) => {
    setSelectedPerson(person);
    setPersonSearchQuery(person.full_name || person.name || '');
    setShowPersonDropdown(false);
    setPersonSearchResults([]);
    // Clear person validation error
    if (validationErrors.person) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.person;
        return newErrors;
      });
    }
  };

  // Initialize form with existing gazette data if in edit mode
  useEffect(() => {
    if (editMode && initialGazette) {
      // Map backend gazette type to frontend notice type
      const typeMapping = {
        'CHANGE_OF_NAME': 'Change of name',
        'CHANGE_OF_DATE_OF_BIRTH': 'Date of birth correction',
        'CHANGE_OF_PLACE_OF_BIRTH': 'Place of birth correction',
        'APPOINTMENT_OF_MARRIAGE_OFFICERS': 'Marriage officer appointment',
        'LEGAL_NOTICE': 'Company name change',
        'PERSONAL_NOTICE': 'Address change'
      };
      
      const mappedType = typeMapping[initialGazette.gazette_type] || '';
      if (mappedType) {
        setNoticeType(mappedType);
      }
      
      // Load person if person_id exists
      const loadPerson = async () => {
        if (initialGazette.person_id) {
          try {
            if (initialGazette.person) {
              setSelectedPerson(initialGazette.person);
              setPersonSearchQuery(initialGazette.person.full_name || initialGazette.person.name || '');
            } else {
              // Fetch person if not loaded
              try {
                const personResponse = await apiGet(`/people/${initialGazette.person_id}`);
                // Handle both direct person object and nested person object
                const person = personResponse.person || personResponse;
                if (person) {
                  setSelectedPerson(person);
                  setPersonSearchQuery(person.full_name || person.name || '');
                }
              } catch (error) {
                console.error('Error loading person:', error);
              }
            }
          } catch (error) {
            console.error('Error loading person:', error);
          }
        }
      };
      loadPerson();
      
      // Populate form data based on notice type
      if (mappedType === 'Change of name') {
        setFormData({
          currentName: initialGazette.new_name || '',
          oldName: initialGazette.old_name || '',
          aliasNames: Array.isArray(initialGazette.alias_names) ? initialGazette.alias_names : [],
          profession: initialGazette.profession || '',
          address: '',
          effectiveDateOfChange: initialGazette.effective_date_of_change ? formatDateForInput(initialGazette.effective_date_of_change) : '',
          remarks: initialGazette.remarks || '',
          source: {
            gazetteNumber: initialGazette.gazette_number || '',
            gazetteDate: initialGazette.gazette_date ? formatDateForInput(initialGazette.gazette_date) : '',
            itemNo: initialGazette.item_number || '',
            pageNo: initialGazette.gazette_page ? initialGazette.gazette_page.toString() : ''
          }
        });
      } else if (mappedType === 'Date of birth correction') {
        // For DOB correction, use new_name or fall back to old_name or person name
        const dobName = initialGazette.new_name || initialGazette.old_name || '';
        setDobFormData({
          name: dobName,
          newDate: initialGazette.new_date_of_birth ? formatDateForInput(initialGazette.new_date_of_birth) : '',
          oldDate: initialGazette.old_date_of_birth ? formatDateForInput(initialGazette.old_date_of_birth) : '',
          profession: initialGazette.profession || '',
          address: '',
          effectiveDateOfChange: initialGazette.effective_date_of_change ? formatDateForInput(initialGazette.effective_date_of_change) : '',
          remarks: initialGazette.remarks || '',
          source: {
            gazetteNumber: initialGazette.gazette_number || '',
            gazetteDate: initialGazette.gazette_date ? formatDateForInput(initialGazette.gazette_date) : '',
            itemNo: initialGazette.item_number || '',
            pageNo: initialGazette.gazette_page ? initialGazette.gazette_page.toString() : ''
          }
        });
      } else if (mappedType === 'Place of birth correction') {
        setPobFormData({
          name: initialGazette.new_name || '',
          mistakePlace: initialGazette.old_place_of_birth || '',
          correctPlace: initialGazette.new_place_of_birth || '',
          profession: initialGazette.profession || '',
          address: '',
          effectiveDateOfChange: initialGazette.effective_date_of_change ? formatDateForInput(initialGazette.effective_date_of_change) : '',
          remarks: initialGazette.remarks || '',
          source: {
            gazetteNumber: initialGazette.gazette_number || '',
            gazetteDate: initialGazette.gazette_date ? formatDateForInput(initialGazette.gazette_date) : '',
            itemNo: initialGazette.item_number || '',
            pageNo: initialGazette.gazette_page ? initialGazette.gazette_page.toString() : ''
          }
        });
      }
    } else if (!editMode) {
      // Reset form when not in edit mode
      setNoticeType('');
      setFormData({
        currentName: '',
        oldName: '',
        aliasNames: [],
        profession: '',
        address: '',
        effectiveDateOfChange: '',
        remarks: '',
        source: { gazetteNumber: '', gazetteDate: '', itemNo: '', pageNo: '' }
      });
      setDobFormData({
        name: '',
        newDate: '',
        oldDate: '',
        profession: '',
        address: '',
        effectiveDateOfChange: '',
        remarks: '',
        source: { gazetteNumber: '', gazetteDate: '', itemNo: '', pageNo: '' }
      });
      setPobFormData({
        name: '',
        mistakePlace: '',
        correctPlace: '',
        profession: '',
        address: '',
        effectiveDateOfChange: '',
        remarks: '',
        source: { gazetteNumber: '', gazetteDate: '', itemNo: '', pageNo: '' }
      });
      setSelectedPerson(null);
      setPersonSearchQuery('');
      setValidationErrors({});
    }
  }, [editMode, initialGazette]);

  // Handle form submission
  const handleSubmit = async (addAnother = false) => {
    // Validate form
    if (!validateForm()) {
      setSubmitError('Please fix the validation errors before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // Build the gazette entry based on notice type
      let gazetteData = {
        gazette_type: mapNoticeTypeToGazetteType(noticeType),
        person_id: selectedPerson.id
      };

      // Set title and content based on notice type (will be set below)
      let title = '';
      let content = '';
      
      // Preserve or set dates and status
      if (editMode && initialGazette) {
        // Preserve existing dates and metadata
        gazetteData.publication_date = initialGazette.publication_date;
        gazetteData.status = initialGazette.status || 'DRAFT';
        gazetteData.priority = initialGazette.priority || 'MEDIUM';
        gazetteData.is_public = initialGazette.is_public !== undefined ? initialGazette.is_public : true;
        gazetteData.is_featured = initialGazette.is_featured !== undefined ? initialGazette.is_featured : false;
        
        // Preserve additional fields
        if (initialGazette.description) gazetteData.description = initialGazette.description;
        if (initialGazette.summary) gazetteData.summary = initialGazette.summary;
        if (initialGazette.effective_date) gazetteData.effective_date = initialGazette.effective_date;
        if (initialGazette.expiry_date) gazetteData.expiry_date = initialGazette.expiry_date;
        if (initialGazette.source) gazetteData.source = initialGazette.source;
        if (initialGazette.reference_number) gazetteData.reference_number = initialGazette.reference_number;
        if (initialGazette.jurisdiction) gazetteData.jurisdiction = initialGazette.jurisdiction;
        if (initialGazette.court_location) gazetteData.court_location = initialGazette.court_location;
        if (initialGazette.keywords) gazetteData.keywords = initialGazette.keywords;
        if (initialGazette.tags) gazetteData.tags = initialGazette.tags;
      } else {
        // New entry defaults
        gazetteData.publication_date = new Date().toISOString();
        gazetteData.status = 'DRAFT';
        gazetteData.priority = 'MEDIUM';
        gazetteData.is_public = true;
        gazetteData.is_featured = false;
      }

      // Fill data based on notice type
      if (noticeType === 'Change of name') {
        title = `Change of Name - ${formData.currentName || selectedPerson.full_name || ''}`;
        content = `Change of name from ${formData.oldName} to ${formData.currentName}`;
        gazetteData.title = title;
        gazetteData.content = content;
        gazetteData.new_name = formData.currentName;
        gazetteData.old_name = formData.oldName;
        gazetteData.alias_names = formData.aliasNames || [];
        if (formData.profession) gazetteData.profession = formData.profession;
        if (formData.effectiveDateOfChange) {
          gazetteData.effective_date_of_change = parseDateInput(formData.effectiveDateOfChange);
        }
        if (formData.remarks) gazetteData.remarks = formData.remarks;
        if (formData.source.itemNo) gazetteData.item_number = formData.source.itemNo;
        if (formData.source.gazetteNumber) gazetteData.gazette_number = formData.source.gazetteNumber;
        if (formData.source.gazetteDate) {
          gazetteData.gazette_date = parseDateInput(formData.source.gazetteDate);
        }
        if (formData.source.pageNo) {
          gazetteData.gazette_page = parseInt(formData.source.pageNo, 10);
        }
      } else if (noticeType === 'Date of birth correction') {
        title = `Date of Birth Correction - ${dobFormData.name || selectedPerson.full_name || ''}`;
        content = `Date of birth correction from ${dobFormData.oldDate} to ${dobFormData.newDate}`;
        gazetteData.title = title;
        gazetteData.content = content;
        gazetteData.old_date_of_birth = parseDateInput(dobFormData.oldDate);
        gazetteData.new_date_of_birth = parseDateInput(dobFormData.newDate);
        if (dobFormData.profession) gazetteData.profession = dobFormData.profession;
        if (dobFormData.effectiveDateOfChange) {
          gazetteData.effective_date_of_change = parseDateInput(dobFormData.effectiveDateOfChange);
        }
        if (dobFormData.remarks) gazetteData.remarks = dobFormData.remarks;
        if (dobFormData.source.itemNo) gazetteData.item_number = dobFormData.source.itemNo;
        if (dobFormData.source.gazetteNumber) gazetteData.gazette_number = dobFormData.source.gazetteNumber;
        if (dobFormData.source.gazetteDate) {
          gazetteData.gazette_date = parseDateInput(dobFormData.source.gazetteDate);
        }
        if (dobFormData.source.pageNo) {
          gazetteData.gazette_page = parseInt(dobFormData.source.pageNo, 10);
        }
      } else if (noticeType === 'Place of birth correction') {
        title = `Place of Birth Correction - ${pobFormData.name || selectedPerson.full_name || ''}`;
        content = `Place of birth correction from ${pobFormData.mistakePlace} to ${pobFormData.correctPlace}`;
        gazetteData.title = title;
        gazetteData.content = content;
        gazetteData.old_place_of_birth = pobFormData.mistakePlace;
        gazetteData.new_place_of_birth = pobFormData.correctPlace;
        if (pobFormData.profession) gazetteData.profession = pobFormData.profession;
        if (pobFormData.effectiveDateOfChange) {
          gazetteData.effective_date_of_change = parseDateInput(pobFormData.effectiveDateOfChange);
        }
        if (pobFormData.remarks) gazetteData.remarks = pobFormData.remarks;
        if (pobFormData.source.itemNo) gazetteData.item_number = pobFormData.source.itemNo;
        if (pobFormData.source.gazetteNumber) gazetteData.gazette_number = pobFormData.source.gazetteNumber;
        if (pobFormData.source.gazetteDate) {
          gazetteData.gazette_date = parseDateInput(pobFormData.source.gazetteDate);
        }
        if (pobFormData.source.pageNo) {
          gazetteData.gazette_page = parseInt(pobFormData.source.pageNo, 10);
        }
      }

      // Ensure title and content are set (required fields)
      if (!gazetteData.title) {
        gazetteData.title = initialGazette?.title || 'Gazette Entry';
      }
      if (!gazetteData.content) {
        gazetteData.content = initialGazette?.content || '';
      }

      // Submit to API
      let response;
      if (editMode && initialGazette) {
        // Update existing gazette
        response = await apiPut(`/gazette/${initialGazette.id}`, gazetteData);
        showSuccess('Gazette updated successfully');
        setSubmitSuccess(true);
        setSubmitError(null);
        setValidationErrors({});
        
        // In edit mode, after successful update, navigate back after a delay
        // Don't support "add another" in edit mode
        if (!addAnother) {
          setTimeout(() => {
            if (onBack) onBack();
          }, 1500);
        }
      } else {
        // Create new gazette
        response = await apiPost('/gazette', gazetteData);
        showSuccess(editMode ? 'Gazette updated successfully' : 'Gazette created successfully');
        setSubmitSuccess(true);
        setSubmitError(null);
        setValidationErrors({});
        
        if (addAnother) {
          // Reset form but keep person selected
          setNoticeType('');
          setFormData({
            currentName: '',
            oldName: '',
            aliasNames: [],
            profession: '',
            address: '',
            effectiveDateOfChange: '',
            remarks: '',
            source: { gazetteNumber: '', gazetteDate: '', itemNo: '', pageNo: '' }
          });
          setDobFormData({
            name: '',
            newDate: '',
            oldDate: '',
            profession: '',
            address: '',
            effectiveDateOfChange: '',
            remarks: '',
            source: { gazetteNumber: '', gazetteDate: '', itemNo: '', pageNo: '' }
          });
          setPobFormData({
            name: '',
            mistakePlace: '',
            correctPlace: '',
            profession: '',
            address: '',
            effectiveDateOfChange: '',
            remarks: '',
            source: { gazetteNumber: '', gazetteDate: '', itemNo: '', pageNo: '' }
          });
          setNewAliasName('');
          setValidationErrors({});
        } else {
          // Navigate back only for new entries (not edit mode)
          setTimeout(() => {
            if (onBack) onBack();
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error submitting gazette:', error);
      const errorMessage = handleApiError(error, editMode ? 'update gazette' : 'create gazette');
      setSubmitError(errorMessage);
      setSubmitSuccess(false);
      
      // If there are validation errors from the backend, set them
      if (error.detail && typeof error.detail === 'object') {
        setValidationErrors(error.detail);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sample bulk upload data (appears after file upload)
  const bulkUploadedEntries = [
    { uploadDate: '10-10-2025', noticeType: 'Change of name', issueNo: 'CV/1089/2021', uploadedBy: 'Eric Kwaah', uploadTime: '12:45pm', status: 'Valid', statusColor: 'green' },
    { uploadDate: '10-10-2025', noticeType: 'Date of birth correction', issueNo: 'CV/1089/2021', uploadedBy: 'Eric Kwaah', uploadTime: '12:45pm', status: 'Valid', statusColor: 'green' },
    { uploadDate: '10-10-2025', noticeType: 'Place of birth correction', issueNo: 'CV/1089/2021', uploadedBy: 'Eric Kwaah', uploadTime: '12:45pm', status: 'Valid', statusColor: 'green' },
    { uploadDate: '10-10-2025', noticeType: 'Marriage officer appointment', issueNo: 'CV/1089/2021', uploadedBy: 'Eric Kwaah', uploadTime: '12:45pm', status: 'Valid', statusColor: 'green' },
    { uploadDate: '10-10-2025', noticeType: 'Company name change', issueNo: 'CV/1089/2021', uploadedBy: 'Eric Kwaah', uploadTime: '12:45pm', status: 'With error', statusColor: 'red' },
    { uploadDate: '10-10-2025', noticeType: 'Address change', issueNo: 'CV/1089/2021', uploadedBy: 'Eric Kwaah', uploadTime: '12:45pm', status: 'With error', statusColor: 'red' }
  ];

  const getStatusClasses = (color) => {
    switch (color) {
      case 'green':
        return { bg: 'bg-[#30AB401A]', text: 'text-emerald-500' };
      case 'red':
        return { bg: 'bg-[#F359261A]', text: 'text-red-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Form */}
      <div className="px-6 w-full">
        <div className="w-full bg-white px-6 rounded-lg">
          <div className="flex flex-col items-start self-stretch mt-4 mb-10 gap-4">
            {/* Breadcrumb */}
            <div className="flex items-start">
              <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">GAZETTE</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/6ba7fap3_expires_30_days.png"
                className="w-4 h-4 mr-1 object-fill flex-shrink-0"
              />
                <span className="text-[#070810] text-sm whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>{editMode ? 'Edit Gazette' : 'Upload New Gazette'}</span>
            </div>

            {/* Back Button */}
            <button 
              onClick={selectedEntry ? () => setSelectedEntry(null) : onBack} 
              className="cursor-pointer hover:opacity-70"
            >
              <img
                src={selectedEntry ? "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ktj9nbhn_expires_30_days.png" : "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/vqq7u2p3_expires_30_days.png"}
                className="w-4 h-4 object-fill"
              />
            </button>

            {/* Upload Type Toggle */}
            <div className="flex items-start gap-6">
              <button
                onClick={() => {
                  setUploadType('manual');
                  setSelectedEntry(null);
                  setHasUploadedFiles(false);
                }}
                className="flex items-center gap-2 cursor-pointer hover:opacity-70"
              >
                <span className="text-[#040E1B] text-base whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Manual Upload</span>
                <img
                  src={
                    uploadType === 'manual'
                      ? 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/sjzgyx9h_expires_30_days.png'
                      : selectedEntry ? 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/cqlihxf2_expires_30_days.png' : 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/pddaz94n_expires_30_days.png'
                  }
                  className="w-6 h-6 object-fill flex-shrink-0"
                />
              </button>
              <button
                onClick={() => {
                  setUploadType('bulk');
                  setSelectedEntry(null);
                }}
                className="flex items-center gap-2 cursor-pointer hover:opacity-70"
              >
                <span className="text-[#040E1B] text-base whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Bulk Upload</span>
                <img
                  src={
                    uploadType === 'bulk'
                      ? selectedEntry ? 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/y2kjyjk0_expires_30_days.png' : 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/sjzgyx9h_expires_30_days.png'
                      : 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/pddaz94n_expires_30_days.png'
                  }
                  className="w-6 h-6 object-fill flex-shrink-0"
                />
              </button>
            </div>

            {/* Manual Upload Form */}
            {uploadType === 'manual' && (
              <>
                {/* Person Selection - Required First Step */}
                <div className="flex flex-col self-stretch gap-3 border-b border-gray-200 pb-6 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[#040E1B] text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>
                      Select Person <span className="text-red-500">*</span>
                    </span>
                  </div>
                  <div className="flex flex-col items-start gap-2 relative" ref={personDropdownRef}>
                    <div className="flex items-center self-stretch gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search for person by name..."
                          value={personSearchQuery}
                          onChange={(e) => setPersonSearchQuery(e.target.value)}
                          onFocus={() => personSearchQuery.length >= 2 && setShowPersonDropdown(true)}
                          className="w-full text-[#525866] bg-transparent text-sm py-3.5 pl-10 pr-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                          style={{ fontFamily: 'Satoshi' }}
                        />
                      </div>
                      {selectedPerson && (
                        <button
                          onClick={() => {
                            setSelectedPerson(null);
                            setPersonSearchQuery('');
                          }}
                          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-300 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    
                    {/* Selected Person Display */}
                    {selectedPerson && (
                      <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-sm font-semibold text-blue-900">Selected: {selectedPerson.full_name || selectedPerson.name}</span>
                        {selectedPerson.date_of_birth && (
                          <span className="text-xs text-blue-700 ml-2">DOB: {selectedPerson.date_of_birth}</span>
                        )}
                      </div>
                    )}

                    {/* Person Search Dropdown */}
                    {showPersonDropdown && personSearchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B0B8C5] rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                        {personSearchResults.map((person) => (
                          <div
                            key={person.id}
                            onClick={() => selectPerson(person)}
                            className="px-4 py-3 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            style={{ fontFamily: 'Satoshi' }}
                          >
                            <div className="font-medium">{person.full_name || person.name}</div>
                            {person.date_of_birth && (
                              <div className="text-xs text-gray-500">DOB: {person.date_of_birth}</div>
                            )}
                            {person.id_number && (
                              <div className="text-xs text-gray-500">ID: {person.id_number}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {isSearchingPerson && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B0B8C5] rounded-lg shadow-lg z-20 p-4 text-sm text-gray-500">
                        Searching...
                      </div>
                    )}
                    {!selectedPerson && (
                      <p className="text-xs text-gray-500 mt-1">Please select a person before filling the form</p>
                    )}
                    {validationErrors.person && (
                      <span className="text-xs text-red-500 mt-1">{validationErrors.person}</span>
                    )}
                  </div>
                </div>

                {/* Error/Success Messages */}
                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}
                {submitSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600">Gazette entry submitted successfully!</p>
                  </div>
                )}
                {Object.keys(validationErrors).length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-semibold mb-1">Please fix the following errors:</p>
                    <ul className="text-xs text-yellow-700 list-disc list-inside">
                      {Object.values(validationErrors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Form Fields */}
                <div className="flex flex-col self-stretch gap-3" style={{ opacity: selectedPerson ? 1 : 0.5, pointerEvents: selectedPerson ? 'auto' : 'none' }}>
                  {/* Notice Type and Entity Type Row */}
                  <div className="flex items-center self-stretch gap-8">
                    <div className="flex flex-col items-start w-[358px] gap-2 relative" ref={noticeTypeDropdownRef}>
                      <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Notice type <span className="text-red-500">*</span></span>
                      <div 
                        className={`flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid cursor-pointer ${
                          validationErrors.noticeType ? 'border-red-500' : 'border-[#B0B8C5]'
                        }`}
                        onClick={() => setShowNoticeTypeDropdown(!showNoticeTypeDropdown)}
                      >
                        <input
                          type="text"
                          placeholder="Select"
                          value={noticeType}
                          readOnly
                          className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none cursor-pointer"
                          style={{ fontFamily: 'Satoshi' }}
                        />
                        <img
                          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/gdud2j13_expires_30_days.png"
                          className="w-4 h-4 rounded-lg object-fill"
                        />
                      </div>
                      {validationErrors.noticeType && (
                        <span className="text-xs text-red-500">{validationErrors.noticeType}</span>
                      )}
                      {showNoticeTypeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B0B8C5] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          {noticeTypes.map((type) => (
                            <div
                              key={type}
                              onClick={() => {
                                setNoticeType(type);
                                setShowNoticeTypeDropdown(false);
                                // Clear notice type validation error
                                if (validationErrors.noticeType) {
                                  setValidationErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.noticeType;
                                    return newErrors;
                                  });
                                }
                                // Auto-populate name fields from selected person
                                if (selectedPerson) {
                                  const personName = selectedPerson.full_name || selectedPerson.name || '';
                                  if (type === 'Change of name') {
                                    setFormData(prev => ({ ...prev, currentName: personName }));
                                  } else if (type === 'Date of birth correction') {
                                    setDobFormData(prev => ({ ...prev, name: personName }));
                                  } else if (type === 'Place of birth correction') {
                                    setPobFormData(prev => ({ ...prev, name: personName }));
                                  }
                                }
                                // Reset form data when changing notice type
                                if (type !== 'Change of name') {
                                  setFormData({
                                    currentName: '',
                                    oldName: '',
                                    aliasNames: [],
                                    profession: '',
                                    address: '',
                                    effectiveDateOfChange: '',
                                    remarks: '',
                                    source: {
                                      gazetteNumber: '',
                                      gazetteDate: '',
                                      itemNo: '',
                                      pageNo: ''
                                    }
                                  });
                                  setNewAliasName('');
                                }
                                if (type !== 'Date of birth correction') {
                                  setDobFormData({
                                    name: '',
                                    newDate: '',
                                    oldDate: '',
                                    profession: '',
                                    address: '',
                                    effectiveDateOfChange: '',
                                    remarks: '',
                                    source: {
                                      gazetteNumber: '',
                                      gazetteDate: '',
                                      itemNo: '',
                                      pageNo: ''
                                    }
                                  });
                                }
                                if (type !== 'Place of birth correction') {
                                  setPobFormData({
                                    name: '',
                                    mistakePlace: '',
                                    correctPlace: '',
                                    profession: '',
                                    address: '',
                                    effectiveDateOfChange: '',
                                    remarks: '',
                                    source: {
                                      gazetteNumber: '',
                                      gazetteDate: '',
                                      itemNo: '',
                                      pageNo: ''
                                    }
                                  });
                                }
                              }}
                              className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                              style={{ fontFamily: 'Satoshi' }}
                            >
                              {type}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start w-[358px] gap-4">
                      <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Entity type</span>
                      <div className="flex items-start gap-6">
                        <button
                          onClick={() => setEntityType('individual')}
                          className="flex items-center gap-[7px] cursor-pointer hover:opacity-70"
                        >
                          <span className="text-[#040E1B] text-base whitespace-nowrap">Individual</span>
                          <img
                            src={
                              entityType === 'individual'
                                ? 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/u2639qvh_expires_30_days.png'
                                : 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ig728wj5_expires_30_days.png'
                            }
                            className="w-6 h-6 object-fill"
                          />
                        </button>
                        <button
                          onClick={() => setEntityType('company')}
                          className="flex items-center gap-1.5 cursor-pointer hover:opacity-70"
                        >
                          <span className="text-[#040E1B] text-base whitespace-nowrap">Company</span>
                          <img
                            src={
                              entityType === 'company'
                                ? 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/u2639qvh_expires_30_days.png'
                                : 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ig728wj5_expires_30_days.png'
                            }
                            className="w-6 h-6 object-fill"
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Change of Name Fields - Show when notice type is "Change of name" */}
                  {noticeType === 'Change of name' && (
                    <>
                      {/* Current Name and Old Name Row */}
                      <div className="flex items-start self-stretch gap-6">
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Current Name <span className="text-red-500">*</span></span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            value={formData.currentName}
                            onChange={(e) => {
                              setFormData({ ...formData, currentName: e.target.value });
                              if (validationErrors.currentName) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.currentName;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                              validationErrors.currentName ? 'border-red-500' : 'border-[#B0B8C5]'
                            }`}
                            style={{ fontFamily: 'Satoshi' }}
                          />
                          {validationErrors.currentName && (
                            <span className="text-xs text-red-500">{validationErrors.currentName}</span>
                          )}
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Old Name <span className="text-red-500">*</span></span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            value={formData.oldName}
                            onChange={(e) => {
                              setFormData({ ...formData, oldName: e.target.value });
                              if (validationErrors.oldName) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.oldName;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                              validationErrors.oldName ? 'border-red-500' : 'border-[#B0B8C5]'
                            }`}
                            style={{ fontFamily: 'Satoshi' }}
                          />
                          {validationErrors.oldName && (
                            <span className="text-xs text-red-500">{validationErrors.oldName}</span>
                          )}
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Alias Name(s)</span>
                          <div className="flex flex-col self-stretch gap-2">
                            {/* List of alias names */}
                            {formData.aliasNames.map((alias, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={alias}
                                  onChange={(e) => {
                                    const updatedAliases = [...formData.aliasNames];
                                    updatedAliases[index] = e.target.value;
                                    setFormData({ ...formData, aliasNames: updatedAliases });
                                  }}
                                  className="flex-1 text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                                  style={{ fontFamily: 'Satoshi' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedAliases = formData.aliasNames.filter((_, i) => i !== index);
                                    setFormData({ ...formData, aliasNames: updatedAliases });
                                  }}
                                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-solid border-[#B0B8C5] hover:bg-red-50 hover:border-red-300 transition-colors"
                                  style={{ fontFamily: 'Satoshi' }}
                                >
                                  <X className="h-4 w-4 text-[#525866]" />
                                </button>
                              </div>
                            ))}
                            {/* Add new alias name */}
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Enter alias name"
                                value={newAliasName}
                                onChange={(e) => setNewAliasName(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && newAliasName.trim()) {
                                    setFormData({ ...formData, aliasNames: [...formData.aliasNames, newAliasName.trim()] });
                                    setNewAliasName('');
                                  }
                                }}
                                className="flex-1 text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                                style={{ fontFamily: 'Satoshi' }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newAliasName.trim()) {
                                    setFormData({ ...formData, aliasNames: [...formData.aliasNames, newAliasName.trim()] });
                                    setNewAliasName('');
                                  }
                                }}
                                className="flex items-center justify-center w-10 h-10 rounded-lg border border-solid border-[#022658] bg-[#022658] hover:bg-[#1A4983] transition-colors"
                                style={{ fontFamily: 'Satoshi' }}
                              >
                                <Plus className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Profession and Address Row */}
                      <div className="flex items-start self-stretch gap-6">
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Profession</span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            value={formData.profession}
                            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                            className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                            style={{ fontFamily: 'Satoshi' }}
                          />
                        </div>
                        <div className="flex flex-col items-start flex-[2] gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Address</span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                            style={{ fontFamily: 'Satoshi' }}
                          />
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Effective Date of Change</span>
                            <input
                            type="date"
                              value={formData.effectiveDateOfChange}
                              onChange={(e) => setFormData({ ...formData, effectiveDateOfChange: e.target.value })}
                            className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                              style={{ fontFamily: 'Satoshi' }}
                            />
                          {validationErrors.effectiveDateOfChange && (
                            <span className="text-xs text-red-500">{validationErrors.effectiveDateOfChange}</span>
                          )}
                        </div>
                      </div>

                      {/* Remarks Field */}
                      <div className="flex flex-col items-start self-stretch gap-2">
                        <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Remarks</span>
                        <textarea
                          placeholder="Enter remarks here"
                          value={formData.remarks}
                          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                          className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none resize-none min-h-[100px]"
                          style={{ fontFamily: 'Satoshi' }}
                        />
                      </div>

                      {/* Source Section */}
                      <div className="flex flex-col items-start self-stretch gap-3">
                        <span className="text-[#040E1B] text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Poppins' }}>Source</span>
                        <div className="flex flex-col items-start self-stretch gap-3 pl-4 border-l-2 border-[#D4E1EA]">
                          <div className="flex items-start self-stretch gap-6">
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Gazette Number</span>
                              <input
                                type="text"
                                placeholder="Enter here"
                                value={formData.source.gazetteNumber}
                                onChange={(e) => setFormData({ ...formData, source: { ...formData.source, gazetteNumber: e.target.value } })}
                                className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                                style={{ fontFamily: 'Satoshi' }}
                              />
                            </div>
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Gazette Date</span>
                                <input
                                type="date"
                                  value={formData.source.gazetteDate}
                                onChange={(e) => {
                                  setFormData({ ...formData, source: { ...formData.source, gazetteDate: e.target.value } });
                                  if (validationErrors.gazetteDate) {
                                    setValidationErrors(prev => {
                                      const newErrors = { ...prev };
                                      delete newErrors.gazetteDate;
                                      return newErrors;
                                    });
                                  }
                                }}
                                className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                                  validationErrors.gazetteDate ? 'border-red-500' : 'border-[#B0B8C5]'
                                }`}
                                  style={{ fontFamily: 'Satoshi' }}
                                />
                              {validationErrors.gazetteDate && (
                                <span className="text-xs text-red-500">{validationErrors.gazetteDate}</span>
                              )}
                            </div>
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Item No.</span>
                              <input
                                type="text"
                                placeholder="Enter here"
                                value={formData.source.itemNo}
                                onChange={(e) => setFormData({ ...formData, source: { ...formData.source, itemNo: e.target.value } })}
                                className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                                style={{ fontFamily: 'Satoshi' }}
                              />
                            </div>
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Page No.</span>
                              <input
                                type="text"
                                placeholder="Enter here"
                                value={formData.source.pageNo}
                                onChange={(e) => setFormData({ ...formData, source: { ...formData.source, pageNo: e.target.value } })}
                                className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                                style={{ fontFamily: 'Satoshi' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Change of Date of Birth Fields - Show when notice type is "Date of birth correction" */}
                  {noticeType === 'Date of birth correction' && (
                    <>
                      {/* Name, New Date, and Old Date Row */}
                      <div className="flex items-start self-stretch gap-6">
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Name <span className="text-red-500">*</span></span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            value={dobFormData.name}
                            onChange={(e) => {
                              setDobFormData({ ...dobFormData, name: e.target.value });
                              if (validationErrors.name) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.name;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                              validationErrors.name ? 'border-red-500' : 'border-[#B0B8C5]'
                            }`}
                            style={{ fontFamily: 'Satoshi' }}
                          />
                          {validationErrors.name && (
                            <span className="text-xs text-red-500">{validationErrors.name}</span>
                          )}
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>New Date of Birth <span className="text-red-500">*</span></span>
                            <input
                            type="date"
                              value={dobFormData.newDate}
                            onChange={(e) => {
                              setDobFormData({ ...dobFormData, newDate: e.target.value });
                              if (validationErrors.newDate) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.newDate;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                              validationErrors.newDate ? 'border-red-500' : 'border-[#B0B8C5]'
                            }`}
                              style={{ fontFamily: 'Satoshi' }}
                            />
                          {validationErrors.newDate && (
                            <span className="text-xs text-red-500">{validationErrors.newDate}</span>
                          )}
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Old Date of Birth <span className="text-red-500">*</span></span>
                            <input
                            type="date"
                              value={dobFormData.oldDate}
                            onChange={(e) => {
                              setDobFormData({ ...dobFormData, oldDate: e.target.value });
                              if (validationErrors.oldDate) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.oldDate;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                              validationErrors.oldDate ? 'border-red-500' : 'border-[#B0B8C5]'
                            }`}
                              style={{ fontFamily: 'Satoshi' }}
                            />
                          {validationErrors.oldDate && (
                            <span className="text-xs text-red-500">{validationErrors.oldDate}</span>
                          )}
                        </div>
                      </div>

                      {/* Profession and Address Row */}
                      <div className="flex items-start self-stretch gap-6">
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Profession</span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            value={dobFormData.profession}
                            onChange={(e) => setDobFormData({ ...dobFormData, profession: e.target.value })}
                            className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                            style={{ fontFamily: 'Satoshi' }}
                          />
                        </div>
                        <div className="flex flex-col items-start flex-[2] gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Address</span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            value={dobFormData.address}
                            onChange={(e) => setDobFormData({ ...dobFormData, address: e.target.value })}
                            className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                            style={{ fontFamily: 'Satoshi' }}
                          />
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Effective Date of Change</span>
                            <input
                            type="date"
                              value={dobFormData.effectiveDateOfChange}
                            onChange={(e) => {
                              setDobFormData({ ...dobFormData, effectiveDateOfChange: e.target.value });
                              if (validationErrors.dobEffectiveDateOfChange) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.dobEffectiveDateOfChange;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                              validationErrors.dobEffectiveDateOfChange ? 'border-red-500' : 'border-[#B0B8C5]'
                            }`}
                              style={{ fontFamily: 'Satoshi' }}
                            />
                          {validationErrors.dobEffectiveDateOfChange && (
                            <span className="text-xs text-red-500">{validationErrors.dobEffectiveDateOfChange}</span>
                          )}
                        </div>
                      </div>

                      {/* Remarks Field */}
                      <div className="flex flex-col items-start self-stretch gap-2">
                        <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Remarks</span>
                        <textarea
                          placeholder="Enter remarks here"
                          value={dobFormData.remarks}
                          onChange={(e) => setDobFormData({ ...dobFormData, remarks: e.target.value })}
                          className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none resize-none min-h-[100px]"
                          style={{ fontFamily: 'Satoshi' }}
                        />
                      </div>

                      {/* Source Section */}
                      <div className="flex flex-col items-start self-stretch gap-3">
                        <span className="text-[#040E1B] text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Poppins' }}>Source</span>
                        <div className="flex flex-col items-start self-stretch gap-3 pl-4 border-l-2 border-[#D4E1EA]">
                          <div className="flex items-start self-stretch gap-6">
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Gazette Number</span>
                              <input
                                type="text"
                                placeholder="Enter here"
                                value={dobFormData.source.gazetteNumber}
                                onChange={(e) => setDobFormData({ ...dobFormData, source: { ...dobFormData.source, gazetteNumber: e.target.value } })}
                                className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                                style={{ fontFamily: 'Satoshi' }}
                              />
                            </div>
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Gazette Date</span>
                                <input
                                type="date"
                                  value={dobFormData.source.gazetteDate}
                                onChange={(e) => {
                                  setDobFormData({ ...dobFormData, source: { ...dobFormData.source, gazetteDate: e.target.value } });
                                  if (validationErrors.dobGazetteDate) {
                                    setValidationErrors(prev => {
                                      const newErrors = { ...prev };
                                      delete newErrors.dobGazetteDate;
                                      return newErrors;
                                    });
                                  }
                                }}
                                className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                                  validationErrors.dobGazetteDate ? 'border-red-500' : 'border-[#B0B8C5]'
                                }`}
                                  style={{ fontFamily: 'Satoshi' }}
                                />
                              {validationErrors.dobGazetteDate && (
                                <span className="text-xs text-red-500">{validationErrors.dobGazetteDate}</span>
                              )}
                            </div>
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Item No.</span>
                              <input
                                type="text"
                                placeholder="Enter here"
                                value={dobFormData.source.itemNo}
                                onChange={(e) => setDobFormData({ ...dobFormData, source: { ...dobFormData.source, itemNo: e.target.value } })}
                                className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                                style={{ fontFamily: 'Satoshi' }}
                              />
                            </div>
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Page No.</span>
                              <input
                                type="text"
                                placeholder="Enter here"
                                value={dobFormData.source.pageNo}
                                onChange={(e) => setDobFormData({ ...dobFormData, source: { ...dobFormData.source, pageNo: e.target.value } })}
                                className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                                style={{ fontFamily: 'Satoshi' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Change of Place of Birth Fields - Show when notice type is "Place of birth correction" */}
                  {noticeType === 'Place of birth correction' && (
                    <>
                      {/* Name, Mistake Place, and Correct Place Row */}
                      <div className="flex items-start self-stretch gap-6">
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Name <span className="text-red-500">*</span></span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            value={pobFormData.name}
                            onChange={(e) => {
                              setPobFormData({ ...pobFormData, name: e.target.value });
                              if (validationErrors.pobName) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.pobName;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                              validationErrors.pobName ? 'border-red-500' : 'border-[#B0B8C5]'
                            }`}
                            style={{ fontFamily: 'Satoshi' }}
                          />
                          {validationErrors.pobName && (
                            <span className="text-xs text-red-500">{validationErrors.pobName}</span>
                          )}
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Mistake Place <span className="text-red-500">*</span></span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            value={pobFormData.mistakePlace}
                            onChange={(e) => {
                              setPobFormData({ ...pobFormData, mistakePlace: e.target.value });
                              if (validationErrors.mistakePlace) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.mistakePlace;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                              validationErrors.mistakePlace ? 'border-red-500' : 'border-[#B0B8C5]'
                            }`}
                            style={{ fontFamily: 'Satoshi' }}
                          />
                          {validationErrors.mistakePlace && (
                            <span className="text-xs text-red-500">{validationErrors.mistakePlace}</span>
                          )}
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Correct Place <span className="text-red-500">*</span></span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            value={pobFormData.correctPlace}
                            onChange={(e) => {
                              setPobFormData({ ...pobFormData, correctPlace: e.target.value });
                              if (validationErrors.correctPlace) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.correctPlace;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                              validationErrors.correctPlace ? 'border-red-500' : 'border-[#B0B8C5]'
                            }`}
                            style={{ fontFamily: 'Satoshi' }}
                          />
                          {validationErrors.correctPlace && (
                            <span className="text-xs text-red-500">{validationErrors.correctPlace}</span>
                          )}
                        </div>
                      </div>

                      {/* Profession and Address Row */}
                      <div className="flex items-start self-stretch gap-6">
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Profession</span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            value={pobFormData.profession}
                            onChange={(e) => setPobFormData({ ...pobFormData, profession: e.target.value })}
                            className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                            style={{ fontFamily: 'Satoshi' }}
                          />
                        </div>
                        <div className="flex flex-col items-start flex-[2] gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Address</span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            value={pobFormData.address}
                            onChange={(e) => setPobFormData({ ...pobFormData, address: e.target.value })}
                            className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                            style={{ fontFamily: 'Satoshi' }}
                          />
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Effective Date of Change</span>
                            <input
                            type="date"
                              value={pobFormData.effectiveDateOfChange}
                            onChange={(e) => {
                              setPobFormData({ ...pobFormData, effectiveDateOfChange: e.target.value });
                              if (validationErrors.pobEffectiveDateOfChange) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.pobEffectiveDateOfChange;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                              validationErrors.pobEffectiveDateOfChange ? 'border-red-500' : 'border-[#B0B8C5]'
                            }`}
                              style={{ fontFamily: 'Satoshi' }}
                            />
                          {validationErrors.pobEffectiveDateOfChange && (
                            <span className="text-xs text-red-500">{validationErrors.pobEffectiveDateOfChange}</span>
                          )}
                        </div>
                      </div>

                      {/* Remarks Field */}
                      <div className="flex flex-col items-start self-stretch gap-2">
                        <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Remarks</span>
                        <textarea
                          placeholder="Enter remarks here"
                          value={pobFormData.remarks}
                          onChange={(e) => setPobFormData({ ...pobFormData, remarks: e.target.value })}
                          className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none resize-none min-h-[100px]"
                          style={{ fontFamily: 'Satoshi' }}
                        />
                      </div>

                      {/* Source Section */}
                      <div className="flex flex-col items-start self-stretch gap-3">
                        <span className="text-[#040E1B] text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Poppins' }}>Source</span>
                        <div className="flex flex-col items-start self-stretch gap-3 pl-4 border-l-2 border-[#D4E1EA]">
                          <div className="flex items-start self-stretch gap-6">
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Gazette Number</span>
                              <input
                                type="text"
                                placeholder="Enter here"
                                value={pobFormData.source.gazetteNumber}
                                onChange={(e) => setPobFormData({ ...pobFormData, source: { ...pobFormData.source, gazetteNumber: e.target.value } })}
                                className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                                style={{ fontFamily: 'Satoshi' }}
                              />
                            </div>
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Gazette Date</span>
                                <input
                                type="date"
                                  value={pobFormData.source.gazetteDate}
                                onChange={(e) => {
                                  setPobFormData({ ...pobFormData, source: { ...pobFormData.source, gazetteDate: e.target.value } });
                                  if (validationErrors.pobGazetteDate) {
                                    setValidationErrors(prev => {
                                      const newErrors = { ...prev };
                                      delete newErrors.pobGazetteDate;
                                      return newErrors;
                                    });
                                  }
                                }}
                                className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                                  validationErrors.pobGazetteDate ? 'border-red-500' : 'border-[#B0B8C5]'
                                }`}
                                  style={{ fontFamily: 'Satoshi' }}
                                />
                              {validationErrors.pobGazetteDate && (
                                <span className="text-xs text-red-500">{validationErrors.pobGazetteDate}</span>
                              )}
                            </div>
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Item No.</span>
                              <input
                                type="text"
                                placeholder="Enter here"
                                value={pobFormData.source.itemNo}
                                onChange={(e) => setPobFormData({ ...pobFormData, source: { ...pobFormData.source, itemNo: e.target.value } })}
                                className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                                style={{ fontFamily: 'Satoshi' }}
                              />
                            </div>
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Page No.</span>
                              <input
                                type="text"
                                placeholder="Enter here"
                                value={pobFormData.source.pageNo}
                                onChange={(e) => setPobFormData({ ...pobFormData, source: { ...pobFormData.source, pageNo: e.target.value } })}
                                className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                                style={{ fontFamily: 'Satoshi' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Default Fields - Show when notice type is not "Change of name", "Date of birth correction", or "Place of birth correction" or not selected */}
                  {noticeType !== 'Change of name' && noticeType !== 'Date of birth correction' && noticeType !== 'Place of birth correction' && (
                    <>
                      {/* Names and DOB Row */}
                      <div className="flex items-start self-stretch gap-6">
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Previous name</span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                          />
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">New name</span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                          />
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Date of birth</span>
                          <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5]">
                            <input
                              type="text"
                              placeholder="Day/Month/Year"
                              className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none"
                            />
                            <img
                              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/q1ii7px2_expires_30_days.png"
                              className="w-4 h-4 rounded-lg object-fill"
                            />
                          </div>
                        </div>
                      </div>

                      {/* National ID, Reason and Effective Date Row */}
                      <div className="flex items-start self-stretch gap-6">
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">National ID</span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                          />
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Reason for change</span>
                          <input
                            type="text"
                            placeholder="Enter here"
                            className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                          />
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Change effective from</span>
                          <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5]">
                            <input
                              type="text"
                              placeholder="Day/Month/Year"
                              className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none"
                            />
                            <img
                              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/pq6opmiv_expires_30_days.png"
                              className="w-4 h-4 rounded-lg object-fill"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Link to Existing Profile Section */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-center self-stretch">
                    <span className="text-[#868C98] text-xl whitespace-nowrap">Link to existing profile</span>
                    <span className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline whitespace-nowrap">
                      Search existing person
                    </span>
                  </div>
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Person name</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Date of birth</span>
                      <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5]">
                        <input
                          type="text"
                          placeholder="Day/Month/Year"
                          className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none"
                        />
                        <img
                          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/4dr09hyl_expires_30_days.png"
                          className="w-4 h-4 rounded-lg object-fill"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Bulk Upload Interface */}
            {uploadType === 'bulk' && !selectedEntry && (
              <>
                {/* Show parsed entries if files are uploaded */}
                {hasUploadedFiles && parsedEntries.length > 0 && (
                  <div className="flex flex-col w-full gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-hidden mb-4">
                    {/* Summary */}
                    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">
                          {uploadedFile?.name} - {parsedEntries.length} entries found
                        </span>
                        <span className="text-xs text-blue-700">
                          Valid: {parsedEntries.filter(e => !e.error).length} | 
                          Errors: {parsedEntries.filter(e => e.error).length}
                        </span>
                      </div>
                      {isUploading && (
                        <div className="mt-2">
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(uploadProgress.processed / uploadProgress.total) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-blue-700 mt-1">
                            Processing: {uploadProgress.processed} / {uploadProgress.total} 
                            (Success: {uploadProgress.success}, Failed: {uploadProgress.failed})
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Table Header */}
                    <div className="flex items-start w-full bg-[#F4F6F9] py-4 px-4 gap-3">
                      <div className="flex flex-col items-start w-[10%] py-[7px]">
                        <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Row</span>
                      </div>
                      <div className="flex flex-col items-start w-[15%] py-[7px]">
                        <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Notice Type</span>
                      </div>
                      <div className="flex flex-col items-start w-[15%] py-[7px]">
                        <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Name</span>
                      </div>
                      <div className="flex flex-col items-start w-[12%] py-[7px]">
                        <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Gazette No.</span>
                      </div>
                      <div className="flex flex-col items-start w-[15%] py-[7px]">
                        <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Date</span>
                      </div>
                      <div className="flex flex-col items-start w-[18%] py-[7px]">
                        <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Status</span>
                      </div>
                      <div className="flex flex-col items-start w-[15%] py-[7px]">
                        <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Error</span>
                      </div>
                    </div>

                    {/* Table Rows */}
                    <div className="max-h-96 overflow-y-auto">
                      {parsedEntries.map((item, idx) => {
                        const statusClasses = getStatusClasses(item.statusColor);
                        return (
                          <div key={idx} className="flex items-center w-full py-3 px-4 gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100">
                            <div className="flex flex-col items-start w-[10%] py-[7px]">
                              <span className="text-[#070810] text-sm whitespace-nowrap">{item.rowNumber}</span>
                            </div>
                            <div className="flex flex-col items-start w-[15%] py-[7px]">
                              <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.noticeType}</span>
                            </div>
                            <div className="flex flex-col items-start w-[15%] py-[7px]">
                              <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.currentName}</span>
                            </div>
                            <div className="flex flex-col items-start w-[12%] py-[7px]">
                              <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.gazetteNumber}</span>
                            </div>
                            <div className="flex flex-col items-start w-[15%] py-[7px]">
                              <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.gazetteDate}</span>
                            </div>
                            <div className="flex flex-col w-[18%] py-2 px-4">
                              <button className={`flex flex-col items-center self-stretch ${statusClasses.bg} text-left py-1 rounded-lg border-0`}>
                                <span className={`${statusClasses.text} text-xs whitespace-nowrap`}>{item.status}</span>
                              </button>
                            </div>
                            <div className="flex flex-col items-start w-[15%] py-[7px]">
                              {item.error && (
                                <span className="text-red-500 text-xs whitespace-normal">{item.error}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Download Template Section */}
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#040E1B] text-sm font-medium">Download template:</span>
                    <button
                      onClick={downloadCSVTemplate}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      CSV Template
                    </button>
                    <button
                      onClick={downloadExcelTemplate}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Excel Template
                    </button>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Instructions:</strong> Download a template file, fill in the required fields (marked with *), 
                      and upload it. The template includes sample data for different notice types. 
                      Notice Type options: "Change of name", "Date of birth correction", "Place of birth correction", 
                      "Marriage officer appointment", "Company name change", "Address change"
                    </p>
                  </div>
                </div>

                {/* File Upload Box */}
                <div className="flex flex-col items-center py-4 px-8 gap-3 rounded-lg border border-solid border-[#B0B8C5]">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <img
                    src={uploadedFile ? "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/txsitkn8_expires_30_days.png" : "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/rr7zx4tp_expires_30_days.png"}
                    className="w-10 h-10 object-fill flex-shrink-0"
                  />
                  <span className="text-[#040E1B] text-sm whitespace-nowrap">
                    {uploadedFile ? uploadedFile.name : 'Browse & choose files you want to upload'}
                  </span>
                  <span className="text-[#525866] text-sm whitespace-nowrap text-center">
                    Accepted formats: CSV, Excel (.xlsx, .xls) Max file size 10MB
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center text-left py-2 px-2.5 gap-1.5 rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(180deg, #0F2847, #1A4983)' }}
                  >
                    <span className="text-white text-xs font-bold whitespace-nowrap">
                      {uploadedFile ? 'Change File' : 'Upload here'}
                    </span>
                    <img
                      src={uploadedFile ? "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ihwhykis_expires_30_days.png" : "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/n165k5da_expires_30_days.png"}
                      className="w-3 h-3 object-fill flex-shrink-0"
                    />
                  </button>
                </div>
              </>
            )}

            {/* Bulk Upload - Edit Entry Form */}
            {uploadType === 'bulk' && selectedEntry && (
              <div className="flex flex-col self-stretch gap-3">
                {/* Notice Type, Issue Number and Entity Type Row */}
                <div className="flex items-center self-stretch gap-8">
                  <div className="flex flex-col items-start w-[358px] gap-2">
                    <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Notice type</span>
                    <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5]">
                      <input
                        type="text"
                        placeholder="Select"
                        defaultValue={selectedEntry.noticeType}
                        className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none"
                      />
                      <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/s6bfq5rr_expires_30_days.png"
                        className="w-4 h-4 rounded-lg object-fill"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-start w-[342px] gap-2">
                    <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Issue number</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      defaultValue={selectedEntry.issueNo}
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>

                  <div className="flex flex-col items-start w-[358px] gap-4">
                    <span className="text-[#040E1B] text-sm font-bold">Entity type</span>
                    <div className="flex items-start gap-6">
                      <button
                        onClick={() => setEntityType('individual')}
                        className="flex items-center gap-[7px] cursor-pointer hover:opacity-70"
                      >
                        <span className="text-[#040E1B] text-base whitespace-nowrap">Individual</span>
                        <img
                          src={
                            entityType === 'individual'
                              ? 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/irnzv9bj_expires_30_days.png'
                              : 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/sq9bnheu_expires_30_days.png'
                          }
                          className="w-6 h-6 object-fill flex-shrink-0"
                        />
                      </button>
                      <button
                        onClick={() => setEntityType('company')}
                        className="flex items-center gap-1.5 cursor-pointer hover:opacity-70"
                      >
                        <span className="text-[#040E1B] text-base whitespace-nowrap">Company</span>
                        <img
                          src={
                            entityType === 'company'
                              ? 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/irnzv9bj_expires_30_days.png'
                              : 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/sq9bnheu_expires_30_days.png'
                          }
                          className="w-6 h-6 object-fill flex-shrink-0"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Names and DOB Row */}
                <div className="flex items-start self-stretch gap-6">
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Previous name</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">New name</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Date of birth</span>
                    <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5]">
                      <input
                        type="text"
                        placeholder="Day/Month/Year"
                        className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none"
                      />
                      <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/iphaurr4_expires_30_days.png"
                        className="w-4 h-4 rounded-lg object-fill"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Field */}
                <div className="flex flex-col items-start self-stretch gap-2">
                  <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Summary</span>
                  <div className="flex flex-col items-start self-stretch pl-4 rounded-lg border border-solid border-[#B0B8C5]">
                    <textarea
                      placeholder="Type a summary"
                      className="self-stretch text-[#525866] bg-transparent text-sm border-0 outline-none resize-none mt-3 mb-[216px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Link to Existing Profile - for edit view */}
            {uploadType === 'bulk' && selectedEntry && (
              <div className="flex flex-col self-stretch gap-2">
                <div className="flex justify-between items-center self-stretch">
                  <span className="text-[#868C98] text-xl whitespace-nowrap">Link to existing profile</span>
                  <span className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline whitespace-nowrap">
                    Search existing person
                  </span>
                </div>
                <div className="flex items-start self-stretch gap-6">
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Person name</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Date of birth</span>
                    <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5]">
                      <input
                        type="text"
                        placeholder="Day/Month/Year"
                        className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none"
                      />
                      <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/17ft8xpc_expires_30_days.png"
                        className="w-4 h-4 rounded-lg object-fill"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`flex items-start self-stretch gap-10 ${uploadType === 'bulk' && selectedEntry ? 'mb-[133px]' : uploadType === 'bulk' && hasUploadedFiles ? 'mb-11' : uploadType === 'bulk' ? 'mb-[535px]' : 'mb-[332px]'}`}>
            {uploadType === 'manual' ? (
              <>
                {!editMode && (
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={!selectedPerson || !noticeType || isSubmitting}
                    className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-2 border-solid border-[#022658] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
                  >
                    <span className="text-[#022658] text-base font-bold whitespace-nowrap">
                      {isSubmitting ? 'Uploading...' : 'Upload & add another gazette'}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={!selectedPerson || !noticeType || isSubmitting}
                  className={`flex flex-col items-center py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
                    editMode ? 'flex-1' : 'flex-1'
                  }`}
                  style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
                >
                  <span className="text-white text-base font-bold whitespace-nowrap">
                    {isSubmitting ? (editMode ? 'Updating...' : 'Uploading...') : (editMode ? 'Update gazette' : 'Upload gazette')}
                  </span>
                </button>
              </>
            ) : selectedEntry ? (
              <>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-2 border-solid border-[#022658] hover:bg-gray-50 transition-colors"
                  style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
                >
                  <span className="text-[#022658] text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Return To Table</span>
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
                >
                  <span className="text-white text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Save And Continue</span>
                </button>
              </>
            ) : uploadType === 'bulk' && hasUploadedFiles && parsedEntries.length > 0 ? (
              <>
                <button
                  onClick={handleBulkUpload}
                  disabled={isUploading || parsedEntries.filter(e => !e.error).length === 0}
                  className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(180deg, #0F2847, #1A4983)' }}
                >
                  <span className="text-white text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>
                    {isUploading ? `Uploading... (${uploadProgress.processed}/${uploadProgress.total})` : 'Upload Gazette'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setParsedEntries([]);
                    setUploadedFile(null);
                    setHasUploadedFiles(false);
                    setUploadErrors([]);
                    setUploadProgress({ total: 0, processed: 0, success: 0, failed: 0 });
                  }}
                  disabled={isUploading}
                  className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-2 border-solid border-[#022658] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-[#022658] text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Cancel Upload</span>
                </button>
              </>
            ) : hasUploadedFiles ? (
              <>
                <button
                  className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-2 border-solid border-[#022658] hover:bg-gray-50 transition-colors"
                  style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
                >
                  <span className="text-[#022658] text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Proceed With Valid Entries Only</span>
                </button>
                <button
                  className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
                >
                  <span className="text-white text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Upload Gazette</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onBack}
                  className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-2 border-solid border-[#022658] hover:bg-gray-50 transition-colors"
                  style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
                >
                  <span className="text-[#022658] text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Cancel Upload</span>
                </button>
                <button
                  className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
                >
                  <span className="text-white text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Upload Gazette</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadGazetteForm;

