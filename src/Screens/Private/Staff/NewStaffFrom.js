import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Text, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import CommanView from '../../../Component/CommanView';
import Typography from '../../../Component/UI/Typography';
import { Font } from '../../../Constants/Font';
import Input from '../../../Component/Input';
import HeaderForUser from '../../../Component/HeaderForUser';
import Button from '../../../Component/Button';
import DropdownComponent from '../../../Component/DropdownComponent';
import UploadBox from '../../../Component/UploadBox';
import Date_Picker from '../../../Component/Date_Picker';
import GooglePlacesInput from '../../../Component/GooglePlacesInput';
import MapLocationPicker from '../../../Component/MapLocationPicker';
import { ImageConstant } from '../../../Constants/ImageConstant';
import { isPlaceholderImage } from '../../../Utils/ImageUtils';
import LocalizedStrings from '../../../Constants/localization';
import { POST_FORM_DATA, GET_WITH_TOKEN, POST_WITH_TOKEN } from '../../../Backend/Backend';
import ImageModal from '../../../Component/Modals/ImageModal';
import { validators } from '../../../Backend/Validator';
import { fetchPincodeDetails } from '../../../Backend/Utility';
import SimpleToast from 'react-native-simple-toast';
import moment from 'moment';
import { launchImageLibrary } from 'react-native-image-picker';
import { 
  AddStaff, 
  UpdateStaff, 
  CATEGORY, 
  SUBSCRIPTION_CREATE_EXTRA_STAFF_ORDER, 
  SUBSCRIPTION_VERIFY_EXTRA_STAFF_PAYMENT 
} from '../../../Backend/api_routes';
import { initiatePayment } from '../../../Backend/razorpay';
import ProfileStepRoller from '../../../Component/UI/ProfileStepRoller';
import { useSelector } from 'react-redux';

const NewStaffForm = ({ navigation, route }) => {
  const scrollViewRef = React.useRef(null);
  const sectionYRefs = React.useRef({});
  const [activeStep, setActiveStep] = useState(0);

  const scrollToStep = stepIndex => {
    setActiveStep(stepIndex);
    const targetY = sectionYRefs.current[stepIndex] || 0;
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: Math.max(0, targetY - 10), animated: true });
    }
  };

  const data = route?.params?.userData;
  const userDetail = useSelector(state => state.userDetails);
  const adharNumber = route?.params?.adharNumber;
  const jobId = route?.params?.job_id || null;
  const jobCompensation = route?.params?.job_compensation || 0;
  const jobTitle = route?.params?.job_title || '';
  const jobCompensationType = route?.params?.job_compensation_type || 'monthly';
  const kycInfo = data?.kyc_information || data?.kycInformation || {};
  const existingPoliceClearance =
    data?.verification_certificate ||
    data?.police_clearance_certificate ||
    kycInfo?.police_verification_path ||
    kycInfo?.verification_certificate ||
    '';
  const existingAadharFront =
    data?.aadhar_front || data?.aadhaar_front || kycInfo?.aadhaar_front_path || '';
  const existingAadharBack =
    data?.aadhar_back || data?.aadhaar_back || kycInfo?.aadhaar_back_path || '';
  const existingPhoneNumber =
    data?.phone_number ||
    data?.mobile_number ||
    data?.mobile ||
    data?.phone ||
    data?.contact_number ||
    '';
  const existingPhoneCountryCode =
    data?.phone_number_country_code ||
    data?.phone_number_prefix ||
    data?.country_code ||
    '+91';

  // Personal Details States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberCountryCode, setPhoneNumberCountryCode] = useState('+91');
  const [aadharNumber, setAadharNumber] = useState(adharNumber || '');
  const [gender, setGender] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  // renamed to avoid confusion with React state
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [areaLocality, setAreaLocality] = useState('');
  const [googleLocation, setGoogleLocation] = useState('');
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');
  // Permanent Address States
  const [permStreet, setPermStreet] = useState('');
  const [permCity, setPermCity] = useState('');
  const [permStateName, setPermStateName] = useState('');
  const [permPincode, setPermPincode] = useState('');
  // Previous Owner Contact States
  const [prevOwnerName, setPrevOwnerName] = useState('');
  const [prevOwnerPhone, setPrevOwnerPhone] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('');
  const [relation, setRelation] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentPickerType, setCurrentPickerType] = useState(null);

  // Work Details States
  const [roleDesignation, setRoleDesignation] = useState([]); // array for multi-select
  const [selectedSkills, setSelectedSkills] = useState([]); // array of skills
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [joiningDate, setJoiningDate] = useState('');
  const [salary, setSalary] = useState('');
  const [upiId, setUpiId] = useState('');
  const [payFrequency, setPayFrequency] = useState(null);
  const [workingDays, setWorkingDays] = useState([]); // array of values
  const [salaryClosingDate, setSalaryClosingDate] = useState(null);
  const [preferredWorkCities, setPreferredWorkCities] = useState([]); // array of cities
  const [selectedLanguages, setSelectedLanguages] = useState([]); // array of languages

  // Document States
  const [staffPhoto, setStaffPhoto] = useState(null);
  const [policeClearance, setPoliceClearance] = useState(null);
  const [aadharCard, setAadharCard] = useState(null);
  const [aadharBack, setAadharBack] = useState(null);

  // API States
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Error States
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    aadharNumber: '',
    gender: '',
    dateOfBirth: '',
    street: '',
    city: '',
    stateName: '',
    pincode: '',
    areaLocality: '',
    googleLocation: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    relation: '',
    roleDesignation: '',
    joiningDate: '',
    salary: '',
    payFrequency: '',
    workingDays: '',
  });

  // Gender Options
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  // Pay Frequency Options
  const payFrequencyOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Daily', value: 'daily' },
  ];

  // Salary Closing Date Options (1-28, since months vary)
  const salaryClosingDateOptions = Array.from({ length: 28 }, (_, i) => ({
    label: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} of each month`,
    value: i + 1,
  }));

  // Working Days Options
  const workingDaysOptions = [
    { label: 'Mon', value: 'Monday' },
    { label: 'Tue', value: 'Tuesday' },
    { label: 'Wed', value: 'Wednesday' },
    { label: 'Thu', value: 'Thursday' },
    { label: 'Fri', value: 'Friday' },
    { label: 'Sat', value: 'Saturday' },
    { label: 'Sun', value: 'Sunday' },
  ];

  // Languages list for multi-select
  const languagesList = [
    'English',
    'Hindi',
    'Telugu',
    'Tamil',
    'Kannada',
    'Malayalam',
    'Marathi',
    'Gujarati',
    'Bengali',
    'Punjabi',
    'Odia',
    'Assamese',
    'Urdu',
    'Nepali',
  ];

  // Relation Options — project-appropriate for Indian household staff emergency contacts
  const relationOptions = [
    { label: 'Father', value: 'father' },
    { label: 'Mother', value: 'mother' },
    { label: 'Husband', value: 'husband' },
    { label: 'Wife', value: 'wife' },
    { label: 'Brother', value: 'brother' },
    { label: 'Sister', value: 'sister' },
    { label: 'Son', value: 'son' },
    { label: 'Daughter', value: 'daughter' },
    { label: 'Grandfather', value: 'grandfather' },
    { label: 'Grandmother', value: 'grandmother' },
    { label: 'Uncle', value: 'uncle' },
    { label: 'Aunt', value: 'aunt' },
    { label: 'Cousin', value: 'cousin' },
    { label: 'Nephew', value: 'nephew' },
    { label: 'Niece', value: 'niece' },
    { label: 'Father-in-law', value: 'father_in_law' },
    { label: 'Mother-in-law', value: 'mother_in_law' },
    { label: 'Brother-in-law', value: 'brother_in_law' },
    { label: 'Sister-in-law', value: 'sister_in_law' },
    { label: 'Friend', value: 'friend' },
    { label: 'Neighbour', value: 'neighbour' },
    { label: 'Colleague', value: 'colleague' },
    { label: 'Guardian', value: 'guardian' },
    { label: 'Other', value: 'other' },
  ];

  // Check if editing mode - only true when explicitly passed as edit
  const isEditMode = !!route?.params?.isEdit;
  const staffId = route?.params?.staffId || data?.staff_id || data?.id;

  // Populate form with existing data when editing
  useEffect(() => {
    if (data && data.id) {
      // Personal Details
      if (data.first_name) setFirstName(data.first_name);
      if (data.last_name) setLastName(data.last_name);

      // If first_name is missing but name or full_name is present (common in Aadhaar verified data), split it
      const displayName = data.name || data.full_name || data.fullname;
      if (displayName && !data.first_name && !firstName) {
        const nameParts = String(displayName).trim().split(/\s+/);
        if (nameParts.length > 0) {
          setFirstName(nameParts[0]);
          if (nameParts.length > 1) {
            setLastName(nameParts.slice(1).join(' '));
          }
        }
      }

      if (data.email) setEmail(data.email);
      if (existingPhoneNumber) setPhoneNumber(String(existingPhoneNumber));
      if (existingPhoneCountryCode) {
        setPhoneNumberCountryCode(existingPhoneCountryCode);
      }
      if (data.aadhar_number || data.aadhaar) setAadharNumber(data.aadhar_number || data.aadhaar);

      // Gender - find matching option
      const userGender = data.gender || data.sex;
      if (userGender) {
        const genderOption = genderOptions.find(
          opt =>
            opt.value === userGender ||
            opt.value.toLowerCase() === String(userGender).toLowerCase() ||
            opt.label.toLowerCase() === String(userGender).toLowerCase()
        );
        if (genderOption) {
          setGender(genderOption);
        } else {
          setGender({
            label: String(userGender).charAt(0).toUpperCase() + String(userGender).slice(1),
            value: String(userGender).toLowerCase(),
          });
        }
      }

      // Date of Birth
      const userDob = data.dob || data.birthdate || data.date_of_birth || data.birth_date;
      if (userDob) {
        // Handle different date formats
        const dobMoment = moment(
          userDob,
          ['YYYY-MM-DD', 'DD-MM-YYYY', 'DD/MM/YYYY', moment.ISO_8601],
          true,
        );
        if (dobMoment.isValid()) {
          setDateOfBirth(dobMoment.format('YYYY-MM-DD'));
        } else {
          setDateOfBirth(userDob);
        }
      }

      // Address from addresses array - split present vs permanent by address_type
      if (data.addresses && data.addresses.length > 0) {
        const presentAddr =
          data.addresses.find(a => a.address_type === 'present') ||
          data.addresses.find(a => a.google_location) ||
          null;
        const permAddr = data.addresses.find(a => a.address_type === 'permanent');

        // Present address (Google-based)
        if (presentAddr) {
          if (presentAddr.street) setStreet(presentAddr.street);
          if (presentAddr.city) setCity(presentAddr.city);
          if (presentAddr.state) setStateName(presentAddr.state);
          if (presentAddr.pincode) setPincode(String(presentAddr.pincode));
          if (presentAddr.area_locality) setAreaLocality(presentAddr.area_locality);
          if (presentAddr.google_location) setGoogleLocation(presentAddr.google_location);
          if (presentAddr.lat || presentAddr.latitude) setLat(String(presentAddr.lat || presentAddr.latitude));
          if (presentAddr.long || presentAddr.longitude) setLong(String(presentAddr.long || presentAddr.longitude));
        }

        // Permanent address (Aadhaar)
        if (permAddr) {
          if (permAddr.street) setPermStreet(permAddr.street);
          if (permAddr.city) setPermCity(permAddr.city);
          if (permAddr.state) setPermStateName(permAddr.state);
          if (permAddr.pincode) setPermPincode(String(permAddr.pincode));
        }
      }

      // Relation
      const contactRelation = data.relation || data.user_work_info?.emergency_contact_relation || data.work_info?.emergency_contact_relation;
      if (contactRelation) {
        // Check if it's a string (name) or needs to be mapped to option
        const relationOption = relationOptions.find(
          opt => opt.value === contactRelation || opt.label === contactRelation,
        );
        if (relationOption) {
          setRelation(relationOption);
        } else {
          // If relation is a name string, try to find or create option
          setRelation({
            label: String(contactRelation),
            value: String(contactRelation).toLowerCase(),
          });
        }
      }

      // UPI ID
      if (data.upi_id) setUpiId(data.upi_id);

      const workInfo = data.user_work_info || data.userWorkInfo || data.work_info;
      // Role / Designation prefill
      const rawRole =
        workInfo?.primary_role ||
        workInfo?.role_designation ||
        data?.primary_role ||
        data?.role_designation ||
        data?.role ||
        jobTitle ||
        '';
      if (rawRole) {
        const roleArr = Array.isArray(rawRole)
          ? rawRole
          : typeof rawRole === 'string'
            ? rawRole.split(',').map(r => r.trim()).filter(Boolean)
            : [];
        if (roleArr.length > 0) {
          setRoleDesignation(roleArr);
        }
      }

      // Skills & Expertise prefill
      const rawSkills =
        workInfo?.skills ||
        data?.skills ||
        '';
      if (rawSkills) {
        const skillArr = Array.isArray(rawSkills)
          ? rawSkills
          : typeof rawSkills === 'string'
            ? rawSkills.split(',').map(s => s.trim()).filter(Boolean)
            : [];
        if (skillArr.length > 0) {
          setSelectedSkills(skillArr);
        }
      }

      // Previous Owner Contact prefill
      const prevName = workInfo?.previous_owner_name || workInfo?.prev_owner_name || data?.previous_owner_name || data?.prev_owner_name;
      if (prevName) setPrevOwnerName(prevName);
      const prevPhone = workInfo?.previous_owner_phone || workInfo?.prev_owner_phone || data?.previous_owner_phone || data?.prev_owner_phone;
      if (prevPhone) setPrevOwnerPhone(String(prevPhone));

      if (workInfo) {
        if (workInfo.emergency_contact_name) setEmergencyContactName(workInfo.emergency_contact_name);
        if (workInfo.emergency_contact_number) setEmergencyContactNumber(workInfo.emergency_contact_number);
        if (workInfo.salary) {
          const sNum = Number(workInfo.salary);
          setSalary(!isNaN(sNum) ? (sNum % 1 === 0 ? String(Math.round(sNum)) : String(sNum)) : String(workInfo.salary));
        }
        if (workInfo.pay_frequency) {
          const freqOption = payFrequencyOptions.find(opt => opt.value === workInfo.pay_frequency);
          setPayFrequency(freqOption || { label: workInfo.pay_frequency, value: workInfo.pay_frequency });
        }
        if (workInfo.working_days) {
          try {
            const days = typeof workInfo.working_days === 'string' 
              ? JSON.parse(workInfo.working_days) 
              : workInfo.working_days;
            setWorkingDays(Array.isArray(days) ? days : []);
          } catch (e) {
            setWorkingDays([]);
          }
        }
        if (workInfo.salary_closing_date) {
          const closingOption = salaryClosingDateOptions.find(opt => opt.value === Number(workInfo.salary_closing_date));
          setSalaryClosingDate(closingOption || null);
        }
        if (workInfo.preferred_work_location) {
          const raw = workInfo.preferred_work_location;
          const parsed = raw.split(',').map(s => s.trim()).filter(Boolean);
          setPreferredWorkCities(parsed);
        }
        if (workInfo.languages_spoken) {
          const langs = Array.isArray(workInfo.languages_spoken)
            ? workInfo.languages_spoken.filter(l => l)
            : typeof workInfo.languages_spoken === 'string'
              ? workInfo.languages_spoken.split(',').map(l => l.trim()).filter(l => l)
              : [];
          setSelectedLanguages(langs);
        }
      }

      // Images - only set if it's a real image and not a placeholder
      if (data.image && !isPlaceholderImage(data.image)) {
        setStaffPhoto({ uri: data.image });
      }
      if (existingAadharFront && !isPlaceholderImage(existingAadharFront)) {
        setAadharCard({ uri: existingAadharFront });
      }
      if (existingAadharBack && !isPlaceholderImage(existingAadharBack)) {
        setAadharBack({ uri: existingAadharBack });
      }
      if (existingPoliceClearance && !isPlaceholderImage(existingPoliceClearance)) {
        setPoliceClearance({ uri: existingPoliceClearance });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Auto-fill salary from job compensation if no salary set yet
  useEffect(() => {
    if (jobCompensation && jobCompensation > 0 && !salary) {
      const cNum = Number(jobCompensation);
      setSalary(!isNaN(cNum) ? (cNum % 1 === 0 ? String(Math.round(cNum)) : String(cNum)) : String(jobCompensation));
    }
  }, [jobCompensation]);

  // Clear city and state when pincode is cleared
  useEffect(() => {
    if (!pincode || pincode.length < 6) {
      setCity('');
      setStateName('');
      setErrors(prev => ({ ...prev, city: '', stateName: '' }));
    }
  }, [pincode]);

  // Fetch pincode details and auto-fill city and state
  useEffect(() => {
    const fetchDetails = async () => {
      if (pincode && pincode.length === 6) {
        try {
          const details = await fetchPincodeDetails(pincode);
          if (details && details.city) {
            setCity(details.city);
            setErrors(prev => (prev?.city ? { ...prev, city: null } : prev));
          }
          if (details && details.state) {
            setStateName(details.state);
            setErrors(prev =>
              prev?.stateName ? { ...prev, stateName: null } : prev,
            );
          }
        } catch (error) {
          console.error('Error fetching pincode details:', error);
        }
      }
    };

    // Small delay to avoid multiple calls (matching StepLocation)
    const timer = setTimeout(() => {
      fetchDetails();
    }, 300);

    return () => clearTimeout(timer);
  }, [pincode]);

  // Fetch roles from CATEGORY API on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    setRolesLoading(true);
    GET_WITH_TOKEN(
      CATEGORY,
      success => {
        setRolesLoading(false);
        let rolesData = [];

        if (success?.data && Array.isArray(success.data)) {
          rolesData = success.data.map(role => ({
            label:
              role?.name ||
              role?.title ||
              role?.category_name ||
              role?.category ||
              String(role),
            value: role?.id || role?.value || role?.role_id || role?.name,
            id: role?.id || role?.value || role?.role_id,
          }));
        } else if (success?.roles && Array.isArray(success.roles)) {
          rolesData = success.roles.map(role => ({
            label:
              role?.name ||
              role?.title ||
              role?.category_name ||
              role?.category ||
              String(role),
            value: role?.id || role?.value || role?.role_id || role?.name,
            id: role?.id || role?.value || role?.role_id,
          }));
        } else if (Array.isArray(success)) {
          rolesData = success.map(role => ({
            label:
              role?.name ||
              role?.title ||
              role?.category_name ||
              role?.category ||
              String(role),
            value: role?.id || role?.value || role?.role_id || role?.name,
            id: role?.id || role?.value || role?.role_id,
          }));
        }

        setRoles(rolesData);
      },
      error => {
        setRolesLoading(false);
        SimpleToast.show('Failed to load roles', SimpleToast.SHORT);
      },
    );
  };

  // Match role name to dropdown value when roles are loaded (for edit mode)
  useEffect(() => {
    if (roles.length > 0 && roleDesignation && typeof roleDesignation === 'string') {
      const roleObj = roles.find(
        role =>
          role.label === roleDesignation ||
          role.label?.toLowerCase() === roleDesignation?.toLowerCase() ||
          role.label?.includes(roleDesignation) ||
          roleDesignation?.includes(role.label),
      );
      if (roleObj) {
        setRoleDesignation(roleObj.value || roleObj.id);
      }
    }
  }, [roleDesignation, roles]);

  // Clear error handlers
  const clearError = field => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Image picker handler
  const handleImagePicker = type => {
    setCurrentPickerType(type);
    setShowImageModal(true);
  };

  const handleImageSelected = (images) => {
    if (images && images.length > 0) {
      const asset = images[0];
      const imageData = {
        uri: asset.uri || asset.path,
        type: asset.type || asset.mime || 'image/jpeg',
        name: asset.fileName || asset.filename || `${currentPickerType}_${Date.now()}.jpg`,
        path: asset.path || asset.uri,
      };

      if (currentPickerType === 'staffPhoto') {
        setStaffPhoto(imageData);
      } else if (currentPickerType === 'policeClearance') {
        setPoliceClearance(imageData);
      } else if (currentPickerType === 'aadharCard') {
        setAadharCard(imageData);
      } else if (currentPickerType === 'aadharBack') {
        setAadharBack(imageData);
      }
    }
  };

  // toggle working day for multi-select
  const toggleWorkingDay = dayValue => {
    setWorkingDays(prev => {
      if (prev.includes(dayValue)) {
        return prev.filter(d => d !== dayValue);
      }
      return [...prev, dayValue];
    });
    clearError('workingDays');
  };

  const isAllIndiaSelected = preferredWorkCities.includes('All India');

  const togglePreferredCity = city => {
    if (city === 'All India') {
      setPreferredWorkCities(['All India']);
      return;
    }
    setPreferredWorkCities(prev => {
      const without = prev.filter(c => c !== 'All India');
      if (without.includes(city)) {
        return without.filter(c => c !== city);
      }
      return [...without, city];
    });
  };

  const addCityFromText = city => {
    const trimmed = city.trim();
    if (!trimmed) return;
    setPreferredWorkCities(prev => {
      const without = prev.filter(c => c !== 'All India');
      if (without.includes(trimmed)) return without;
      return [...without, trimmed];
    });
  };

  // toggle language for multi-select
  const toggleLanguage = lang => {
    setSelectedLanguages(prev => {
      if (prev.includes(lang)) {
        return prev.filter(l => l !== lang);
      }
      return [...prev, lang];
    });
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      aadharNumber: '',
      gender: '',
      dateOfBirth: '',
      street: '',
      city: '',
      stateName: '',
      pincode: '',
      areaLocality: '',
      googleLocation: '',
      emergencyContactName: '',
      emergencyContactNumber: '',
      relation: '',
      roleDesignation: '',
      joiningDate: '',
      salary: '',
      payFrequency: '',
      workingDays: '',
    };

    let hasError = false;

    // Validate First Name — use checkName (allows numbers/hyphens/apostrophes)
    // instead of checkAlphabet which rejects digits entirely
    const firstNameError = validators.checkName(
      'First Name',
      2,
      50,
      firstName,
    );
    if (firstNameError) {
      newErrors.firstName = firstNameError;
      hasError = true;
    }

    // Validate Last Name
    const lastNameError = validators.checkName(
      'Last Name',
      2,
      50,
      lastName,
    );
    if (lastNameError) {
      newErrors.lastName = lastNameError;
      hasError = true;
    }

    // Validate Email (optional - only validate format if provided)
    if (email && email.trim() !== '') {
      const emailError = validators.checkEmail('Email', email);
      if (emailError) {
        newErrors.email = emailError;
        hasError = true;
      }
    }

    // Validate Phone Number
    const phoneError = validators.checkFixPhoneNumber(
      'Phone Number',
      phoneNumber,
      10,
      10,
    );
    if (phoneError) {
      newErrors.phoneNumber = phoneError;
      hasError = true;
    }

    // Validate Aadhaar Number
    if (!aadharNumber || aadharNumber.trim() === '') {
      newErrors.aadharNumber = 'Aadhaar Number is required.';
    } else if (!/^\d{12}$/.test(aadharNumber)) {
      newErrors.aadharNumber = 'Aadhaar Number must be 12 digits.';
      hasError = true;
    }

    // Validate Gender
    if (!gender || (!gender?.value && !gender)) {
      newErrors.gender = 'Please select gender';
      hasError = true;
    }

    // Validate Date of Birth
    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth field is required.';
      hasError = true;
    } else {
      const selectedDate = moment(
        dateOfBirth,
        ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601],
        true,
      );
      const today = moment();
      if (!selectedDate.isValid()) {
        newErrors.dateOfBirth = 'Invalid date format for Date of Birth.';
        hasError = true;
      } else if (selectedDate.isAfter(today)) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future.';
        hasError = true;
      }
    }

    // Validate Street
    if (!street || street.trim() === '') {
      newErrors.street = 'Street/Landmark field is required.';
      hasError = true;
    } else if (street.trim().length < 5) {
      newErrors.street = 'Street/Landmark must be at least 5 characters.';
      hasError = true;
    }

    // Validate City
    const cityError = validators.checkName('City', 2, 50, city);
    if (cityError) {
      newErrors.city = cityError;
      hasError = true;
    }

    // Validate State
    const stateError = validators.checkName('State', 2, 50, stateName);
    if (stateError) {
      newErrors.stateName = stateError;
      hasError = true;
    }

    // Validate Pincode
    if (!pincode || pincode.trim() === '') {
      newErrors.pincode = 'Pincode field is required.';
      hasError = true;
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits.';
      hasError = true;
    }

    if (!areaLocality || areaLocality.trim() === '') {
      newErrors.areaLocality = 'Area / Locality field is required.';
      hasError = true;
    }

    // Google Location is optional — staff can add it later

    // Validate Emergency Contact Name (optional - only if provided)
    if (emergencyContactName && emergencyContactName.trim()) {
      const emergencyNameError = validators.checkAlphabet(
        'Emergency Contact Name',
        2,
        50,
        emergencyContactName,
      );
      if (emergencyNameError) {
        newErrors.emergencyContactName = emergencyNameError;
        hasError = true;
      }
    }

    // Validate Emergency Contact Number (optional - only if provided)
    if (emergencyContactNumber && emergencyContactNumber.trim()) {
      const emergencyPhoneError = validators.checkFixPhoneNumber(
        'Emergency Contact Number',
        emergencyContactNumber,
        10,
        10,
      );
      if (emergencyPhoneError) {
        newErrors.emergencyContactNumber = emergencyPhoneError;
        hasError = true;
      }
    }

    // Validate Relation (optional - only if emergency contact is provided)
    if ((emergencyContactName || emergencyContactNumber) && (!relation || (!relation?.value && !relation))) {
      newErrors.relation = 'Please select relation';
      hasError = true;
    }

    // Work details are optional (staff can be a fresher)

    // Validate Joining Date only if provided
    if (joiningDate) {
      const joinDateParsed = moment(
        joiningDate,
        ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601],
        true,
      );
      if (!joinDateParsed.isValid()) {
        newErrors.joiningDate = 'Invalid joining date format.';
        hasError = true;
      }
    }

    // Validate Salary only if provided
    if (salary && salary.trim() !== '') {
      const salaryError = validators.priceCheck('Salary', salary);
      if (salaryError) {
        newErrors.salary = salaryError;
        hasError = true;
      }
    }

    // Validate Google Location
    if (!googleLocation || googleLocation.trim() === '') {
      newErrors.googleLocation = 'Please select a Google Location.';
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const validateStep1 = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      aadharNumber: '',
      gender: '',
      dateOfBirth: '',
      street: '',
      city: '',
      stateName: '',
      pincode: '',
      areaLocality: '',
      googleLocation: '',
    };

    let hasError = false;

    const firstNameError = validators.checkName('First Name', 2, 50, firstName);
    if (firstNameError) { newErrors.firstName = firstNameError; hasError = true; }

    const lastNameError = validators.checkName('Last Name', 2, 50, lastName);
    if (lastNameError) { newErrors.lastName = lastNameError; hasError = true; }

    const phoneError = validators.checkFixPhoneNumber('Phone Number', phoneNumber, 10, 10);
    if (phoneError) { newErrors.phoneNumber = phoneError; hasError = true; }

    if (!aadharNumber || aadharNumber.trim() === '') {
      newErrors.aadharNumber = 'Aadhaar Number is required.';
      hasError = true;
    } else if (!/^\d{12}$/.test(aadharNumber)) {
      newErrors.aadharNumber = 'Aadhaar Number must be 12 digits.';
      hasError = true;
    }

    if (!gender || (!gender?.value && !gender)) {
      newErrors.gender = 'Please select gender.';
      hasError = true;
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required.';
      hasError = true;
    }

    if (!street || street.trim() === '') {
      newErrors.street = 'Street/Landmark is required.';
      hasError = true;
    } else if (street.trim().length < 5) {
      newErrors.street = 'Street/Landmark must be at least 5 characters.';
      hasError = true;
    }

    const cityError = validators.checkName('City', 2, 50, city);
    if (cityError) { newErrors.city = cityError; hasError = true; }

    const stateError = validators.checkName('State', 2, 50, stateName);
    if (stateError) { newErrors.stateName = stateError; hasError = true; }

    if (!pincode || pincode.trim() === '') {
      newErrors.pincode = 'Pincode is required.';
      hasError = true;
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits.';
      hasError = true;
    }

    if (!areaLocality || areaLocality.trim() === '') {
      newErrors.areaLocality = 'Area/Locality is required.';
      hasError = true;
    }

    if (!googleLocation || googleLocation.trim() === '') {
      newErrors.googleLocation = 'Please select a Google Location.';
      hasError = true;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return !hasError;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    } else {
      SimpleToast.show('Please fill all required fields', SimpleToast.SHORT);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (loading) return;

    if (!validateForm()) {
      SimpleToast.show(
        'Please fill all required fields correctly',
        SimpleToast.SHORT,
      );
      return;
    }

    setLoading(true);

    const formData = new FormData();

    // Personal Details - ensure all values are trimmed and not empty
    formData.append('first_name', firstName?.trim() || '');
    formData.append('last_name', lastName?.trim() || '');
    formData.append('email', email?.trim() || '');

    formData.append('phone_number', phoneNumber?.trim() || '');
    formData.append(
      'phone_number_country_code',
      phoneNumberCountryCode || '+91',
    );

    // Handle gender - extract value from dropdown object
    const genderValue = gender?.value || gender || '';
    formData.append('gender', genderValue);

    // Format date of birth properly - should already be in YYYY-MM-DD format from Date_Picker
    if (
      !dateOfBirth ||
      (typeof dateOfBirth === 'string' && dateOfBirth.trim() === '')
    ) {
      SimpleToast.show('Date of birth is required', SimpleToast.SHORT);
      setLoading(false);
      return;
    }
    const dobValue =
      typeof dateOfBirth === 'string'
        ? dateOfBirth.trim()
        : moment(dateOfBirth).format('YYYY-MM-DD');
    formData.append('dob', dobValue);

    formData.append('street', street?.trim() || '');
    formData.append('city', city?.trim() || '');
    formData.append('state', stateName?.trim() || '');
    formData.append('pincode', pincode?.trim() || '');
    formData.append('area_locality', areaLocality?.trim() || '');
    formData.append('google_location', googleLocation?.trim() || '');
    formData.append('lat', lat || '');
    formData.append('long', long || '');

    // Permanent Address
    formData.append('perm_street', permStreet?.trim() || '');
    formData.append('perm_city', permCity?.trim() || '');
    formData.append('perm_state', permStateName?.trim() || '');
    formData.append('perm_pincode', permPincode?.trim() || '');

    // Previous Owner Contact
    formData.append('prev_owner_name', prevOwnerName?.trim() || '');
    formData.append('prev_owner_phone', prevOwnerPhone?.trim() || '');

    formData.append(
      'emergency_contact_name',
      emergencyContactName?.trim() || '',
    );
    formData.append(
      'emergency_contact_number',
      emergencyContactNumber?.trim() || '',
    );

    // Handle relation - extract value from dropdown object
    const relationValue = relation?.value || relation || '';
    formData.append('relation', relationValue);

    formData.append('aadhar_number', aadharNumber?.trim() || '');

    // Job assignment
    if (jobId) {
      formData.append('job_id', jobId);
    }

    // Work Details - all optional (staff can be a fresher)

    // Role designation - handle multi-select array or single string
    if (Array.isArray(roleDesignation) && roleDesignation.length > 0) {
      roleDesignation.forEach((r, idx) => {
        const selectedRoleObj = roles.find(
          role => String(role.value) === String(r) || String(role.id) === String(r) || role.label === String(r)
        );
        const roleName = selectedRoleObj?.label || r?.label || String(r);
        formData.append(`role_designation[${idx}]`, roleName);
      });
    } else if (roleDesignation) {
      const selectedRoleObj = roles.find(
        role => role.value === (roleDesignation?.value || roleDesignation) ||
                role.id === (roleDesignation?.value || roleDesignation),
      );
      const roleName = selectedRoleObj?.label || roleDesignation?.label || roleDesignation || '';
      if (roleName) formData.append('role_designation[0]', String(roleName).trim());
    }

    // Skills & Expertise
    if (selectedSkills.length > 0) {
      selectedSkills.forEach((skill, idx) => {
        formData.append(`required_skills[${idx}]`, skill);
      });
    }

    // Joining date - send default (today) if not provided, backend requires it
    if (joiningDate && (typeof joiningDate !== 'string' || joiningDate.trim() !== '')) {
      const joinDateValue =
        typeof joiningDate === 'string'
          ? joiningDate.trim()
          : moment(joiningDate).format('YYYY-MM-DD');
      formData.append('joining_date', joinDateValue);
    } else {
      formData.append('joining_date', moment().format('YYYY-MM-DD'));
    }

    // Salary - send 0 as default if not provided
    formData.append('salary', salary?.trim() || '0');

    // Salary closing date
    formData.append('salary_closing_date', salaryClosingDate?.value || '');

    if (upiId?.trim()) {
      formData.append('upi_id', upiId.trim());
    }

    // Pay frequency - send default if not selected
    const payFreqValue = payFrequency?.value || payFrequency || 'monthly';
    formData.append('pay_frequency', payFreqValue);

    // Working Days — always use full English names (Monday, Tuesday, …)
    // so backend comparison (strtolower) works correctly.
    // If user selected nothing, default to Mon–Sat (no Sunday).
    const daysToSend =
      Array.isArray(workingDays) && workingDays.length > 0
        ? workingDays
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    daysToSend.forEach((day, index) => {
      formData.append(`working_days[${index}]`, day);
    });

    if (preferredWorkCities.length > 0) {
      formData.append('preferred_work_location', preferredWorkCities.join(', '));
    }

    if (selectedLanguages.length > 0) {
      selectedLanguages.forEach((lang, index) => {
        formData.append(`languages_spoken[${index}]`, lang);
      });
    }

    // Documents - only send newly picked images (they have a .type from image picker)
    // Don't re-send existing server URLs as file uploads
    if (staffPhoto && staffPhoto.uri && staffPhoto.type) {
      formData.append('staff_photo', {
        uri: staffPhoto.uri,
        name: staffPhoto.name || 'staff_photo.jpg',
        type: staffPhoto.type || 'image/jpeg',
      });
    }

    if (!existingPoliceClearance && policeClearance && policeClearance.uri && policeClearance.type) {
      formData.append('police_clearance_certificate', {
        uri: policeClearance.uri,
        name: policeClearance.name || 'police_clearance_certificate.jpg',
        type: policeClearance.type || 'image/jpeg',
      });
    }

    if (!existingAadharFront && aadharCard && aadharCard.uri && aadharCard.type) {
      formData.append('aadhar_front', {
        uri: aadharCard.uri,
        name: aadharCard.name || 'aadhar_front.jpg',
        type: aadharCard.type || 'image/jpeg',
      });
    }

    if (!existingAadharBack && aadharBack && aadharBack.uri && aadharBack.type) {
      formData.append('aadhar_back', {
        uri: aadharBack.uri,
        name: aadharBack.name || 'aadhar_back.jpg',
        type: aadharBack.type || 'image/jpeg',
      });
    }

    formData.append('is_staff_added', 1);

    // If adding an existing user as staff, pass their user_id
    if (data?.id && !isEditMode) {
      formData.append('user_id', String(data.id));
    }

    // Determine API endpoint and add staff_id for update
    const apiEndpoint = isEditMode ? `${UpdateStaff}/${staffId}` : AddStaff;

    if (isEditMode) {
      formData.append('staff_id', String(staffId));
    }
    console.log('apiEndpoint----', apiEndpoint, 'user_id:', data?.id);

    POST_FORM_DATA(
      apiEndpoint,
      formData,
      success => {
        setLoading(false);
        SimpleToast.show(
          success?.message ||
          (isEditMode
            ? 'Staff updated successfully!'
            : 'Staff added successfully!'),
          SimpleToast.SHORT,
        );
        navigation.navigate('TabNavigation', {
          screen: 'Dashboard',
        });
      },
      error => {
        setLoading(false);
        console.log('API Error Full:', JSON.stringify(error));

        if (error?.error_code === 'LIMIT_EXCEEDED' || error?.data?.error_code === 'LIMIT_EXCEEDED') {
          const price = error?.extra_staff_price || error?.data?.extra_staff_price || 500;
          const gstTotal = Math.round(price * 1.18 * 100) / 100;
          const gstAmount = Math.round((price * 0.18) * 100) / 100;
          Alert.alert(
            "Staff Limit Exceeded",
            `Your subscription's staff limit has been reached.\n\nBase: ₹${price}\nGST (18%): ₹${gstAmount}\nTotal: ₹${gstTotal}`,
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Pay & Add", 
                onPress: () => processExtraStaffPayment(price, formData)
              }
            ],
            { cancelable: true }
          );
          return;
        }

        if (error?.limit_reached || error?.data?.limit_reached || error?.status === 403) {
          Alert.alert(
            "Limit Reached",
            error?.message || error?.data?.message || "Staff limit reached. Please upgrade your plan.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Upgrade Plan", onPress: () => navigation.navigate("HouseholdManager") }
            ]
          );
          return;
        }

        // Extract Laravel validation errors
        const validationErrors = error?.errors || error?.data?.errors;
        if (validationErrors && typeof validationErrors === 'object') {
          // Get first validation error message for each field
          const fieldErrors = Object.entries(validationErrors)
            .map(([field, messages]) => {
              const msg = Array.isArray(messages) ? messages[0] : messages;
              return `${field}: ${msg}`;
            })
            .join('\n');
          console.log('Validation errors:', fieldErrors);
          SimpleToast.show(fieldErrors, SimpleToast.LONG);
        } else {
          const errorMessage =
            error?.message ||
            error?.data?.message ||
            error?.response?.data?.message ||
            (isEditMode
              ? 'Failed to update staff. Please try again.'
              : 'Failed to add staff. Please try again.');
          SimpleToast.show(errorMessage, SimpleToast.LONG);
        }
      },
      fail => {
        setLoading(false);
        SimpleToast.show(
          'Network error. Please check your connection and try again.',
          SimpleToast.SHORT,
        );
        console.log('Network Error:-----', fail);
      },
    );
  };

  const processExtraStaffPayment = (price, originalFormData) => {
    setLoading(true);
    POST_WITH_TOKEN(
      SUBSCRIPTION_CREATE_EXTRA_STAFF_ORDER,
      { amount: price },
      async success => {
        if ((success?.success || success?.status) && success?.free) {
          const apiEndpoint = isEditMode ? `${UpdateStaff}/${staffId}` : AddStaff;
          POST_FORM_DATA(
            apiEndpoint,
            originalFormData,
            () => {
              setLoading(false);
              SimpleToast.show('Extra staff limit added. Staff added successfully!', SimpleToast.SHORT);
              navigation.navigate('TabNavigation', {
                screen: 'Dashboard',
              });
            },
            () => {
              setLoading(false);
              SimpleToast.show('Extra staff limit added. Please try adding the staff again.', SimpleToast.SHORT);
            },
            () => {
              setLoading(false);
              SimpleToast.show('Extra staff limit added. Please try adding the staff again.', SimpleToast.SHORT);
            }
          );
          return;
        }

        if ((!success?.success && !success?.status) || !success?.order_id) {
          setLoading(false);
          SimpleToast.show(success?.message || 'Failed to create payment order', SimpleToast.SHORT);
          return;
        }

        try {
          const result = await initiatePayment({
            amount: success.amount || (price * 100),
            currency: success.currency || 'INR',
            orderId: success.order_id,
            key: success.razorpay_key || 'rzp_test_Rcx3E3rF2dNmEc',
            description: 'Extra Staff Limit Purchase',
            prefill: {
              name: userDetail?.first_name ? `${userDetail.first_name} ${userDetail.last_name || ''}` : userDetail?.name || '',
              email: userDetail?.email || '',
              contact: userDetail?.phone || userDetail?.mobile || '',
            },
          });

          if (result.success) {
            verifyExtraStaffPayment(result, originalFormData);
          } else {
            setLoading(false);
            if (result.code === 0 || result.code === 2) {
              SimpleToast.show('Payment cancelled', SimpleToast.SHORT);
            } else {
              SimpleToast.show(result.description || 'Payment failed. Please try again.', SimpleToast.SHORT);
            }
          }
        } catch (paymentErr) {
          setLoading(false);
          SimpleToast.show('Payment checkout error. Please try again.', SimpleToast.SHORT);
        }
      },
      error => {
        setLoading(false);
        SimpleToast.show(error?.message || 'Failed to initialize payment', SimpleToast.SHORT);
      },
      fail => {
        setLoading(false);
        SimpleToast.show('Network error during payment initialization', SimpleToast.SHORT);
      }
    );
  };

  const verifyExtraStaffPayment = (paymentResult, originalFormData) => {
    POST_WITH_TOKEN(
      SUBSCRIPTION_VERIFY_EXTRA_STAFF_PAYMENT,
      {
        razorpay_order_id: paymentResult.orderId,
        razorpay_payment_id: paymentResult.paymentId,
        razorpay_signature: paymentResult.signature,
      },
      success => {
        if (success?.success || success?.status) {
          SimpleToast.show('Payment verified! Adding staff...', SimpleToast.SHORT);
          const apiEndpoint = isEditMode ? `${UpdateStaff}/${staffId}` : AddStaff;
          POST_FORM_DATA(
            apiEndpoint,
            originalFormData,
            postSuccess => {
              SimpleToast.show('Staff added successfully!', SimpleToast.SHORT);
              setLoading(false);
              navigation.navigate('TabNavigation', {
                screen: 'Dashboard',
              });
            },
            postErr => {
              setLoading(false);
              SimpleToast.show('Failed to add staff after payment', SimpleToast.SHORT);
            },
            postFail => {
              setLoading(false);
              SimpleToast.show('Network error adding staff after payment', SimpleToast.SHORT);
            }
          );
        } else {
          setLoading(false);
          SimpleToast.show(success?.message || 'Payment verification failed', SimpleToast.SHORT);
        }
      },
      error => {
        setLoading(false);
        SimpleToast.show(error?.message || 'Payment verification failed', SimpleToast.SHORT);
      },
      fail => {
        setLoading(false);
        SimpleToast.show('Network error verifying payment', SimpleToast.SHORT);
      }
    );
  };

  return (
    <CommanView scrollRef={scrollViewRef}>
      <HeaderForUser
        source_arrow={ImageConstant?.BackArrow}
        title={LocalizedStrings.NewStaffForm.title}
        style_title={styles.headerTitle}
        containerStyle={styles.headerContainer}
        onPressLeftIcon={() => {
          navigation?.goBack();
        }}
      />
      <ProfileStepRoller
        steps={[
          { id: 0, title: 'Personal Info', icon: ImageConstant.person },
          { id: 1, title: 'Address & Map', icon: ImageConstant.Location },
          { id: 2, title: 'Role & Pay', icon: ImageConstant.Briefcase },
          { id: 3, title: 'Verification', icon: ImageConstant.Verify },
        ]}
        activeStep={activeStep}
        onStepPress={scrollToStep}
      />

        {/* Personal Details */}
        <View
          style={styles.section}
          onLayout={e => {
            sectionYRefs.current[0] = e.nativeEvent.layout.y;
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={ImageConstant.person}
              style={{ height: 20, width: 20, marginRight: 8 }}
              resizeMode="contain"
            />
            <Typography
              type={Font?.Poppins_SemiBold}
              style={styles.sectionTitle}
            >
              {LocalizedStrings.NewStaffForm.Personal_Details}
            </Typography>
          </View>

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.First_Name || 'First Name'
            }
            title={LocalizedStrings.NewStaffForm.First_Name || 'First Name'}
            value={firstName}
            onChange={value => {
              setFirstName(value);
              clearError('firstName');
            }}
            error={errors.firstName}
          />

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={LocalizedStrings.NewStaffForm.Last_Name || 'Last Name'}
            title={LocalizedStrings.NewStaffForm.Last_Name || 'Last Name'}
            value={lastName}
            onChange={value => {
              setLastName(value);
              clearError('lastName');
            }}
            error={errors.lastName}
          />



          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.Mobile_Placeholder || '9876543210'
            }
            title={
              LocalizedStrings.NewStaffForm.Mobile_Number || 'Mobile Number'
            }
            value={phoneNumber}
            onChange={value => {
              const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
              setPhoneNumber(digitsOnly);
              clearError('phoneNumber');
            }}
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.phoneNumber}
          />

          {jobId && jobTitle ? (
            <View style={{ backgroundColor: '#FFF8F6', padding: 14, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#D98579' }}>
              <Typography size={12} color="#888" style={{ marginBottom: 4 }}>Assigned Job</Typography>
              <Typography size={15} type={Font?.Poppins_SemiBold} color="#333">{jobTitle}</Typography>
              {jobCompensation > 0 && (
                <Typography size={13} color="#D98579" style={{ marginTop: 4 }}>
                  ₹{parseFloat(jobCompensation).toLocaleString('en-IN')} / {jobCompensationType}
                </Typography>
              )}
            </View>
          ) : null}

          <Input
            editable={false}
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.Aadhaar_Placeholder ||
              '123456789012'
            }
            title={
              LocalizedStrings.NewStaffForm.Aadhaar_Number || 'Aadhaar Number'
            }
            value={aadharNumber}
            onChange={value => {
              setAadharNumber(value);
              clearError('aadharNumber');
            }}
            keyboardType="number-pad"
            maxLength={12}
            error={errors.aadharNumber}
          />

          <DropdownComponent
            title={LocalizedStrings.NewStaffForm.Gender || 'Gender'}
            placeholder={
              LocalizedStrings.NewStaffForm.Select_Gender || 'Select Gender'
            }
            width={'100%'}
            style_dropdown={{ marginHorizontal: 0 }}
            selectedTextStyleNew={{ marginLeft: 10 }}
            marginHorizontal={0}
            style_title={{ textAlign: 'left' }}
            data={genderOptions}
            value={gender}
            onChange={item => {
              setGender(item);
              clearError('gender');
            }}
            error={errors.gender}
          />

          <Date_Picker
            title={
              LocalizedStrings.NewStaffForm.Date_of_Birth || 'Date of Birth'
            }
            placeholder="DD-MM-YYYY"
            selected_date={dateOfBirth}
            onConfirm={date => {
              // Store as Date object or formatted string
              const formattedDate = moment(date).format('YYYY-MM-DD');
              setDateOfBirth(formattedDate);
              clearError('dateOfBirth');
            }}
            allowFutureDates={false}
            error={errors.dateOfBirth}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.nextSectionBtn}
            onPress={() => scrollToStep(1)}
          >
            <Typography style={styles.nextSectionText}>
              Next: Address & Location ↓
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Section 1: Address & Location */}
        <View
          style={styles.section}
          onLayout={e => {
            sectionYRefs.current[1] = e.nativeEvent.layout.y;
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Image
              source={ImageConstant.Location}
              style={{ height: 20, width: 20, marginRight: 8, tintColor: '#D98579' }}
              resizeMode="contain"
            />
            <Typography
              type={Font?.Poppins_SemiBold}
              style={styles.sectionTitle}
            >
              Address & Location
            </Typography>
          </View>

          <MapLocationPicker
            title="Pin Present Location (Google Maps)"
            location={{
              google_location: googleLocation,
              lat: lat,
              long: long,
              street: street,
              area_locality: areaLocality,
              city: city,
              state: stateName,
              pincode: pincode,
            }}
            selectedLabel={[areaLocality, city, stateName].filter(Boolean).join(', ')}
            onConfirm={(location) => {
              setGoogleLocation(location?.google_location || '');
              setLat(location?.lat ? String(location.lat) : '');
              setLong(location?.long ? String(location.long) : '');
              if (location?.street) setStreet(location.street);
              if (location?.area_locality) setAreaLocality(location.area_locality);
              if (location?.city) setCity(location.city);
              if (location?.state) setStateName(location.state);
              if (location?.pincode) setPincode(location.pincode);
              clearError('googleLocation');
            }}
          />

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.Street_Landmark || 'Street/Landmark'
            }
            title={LocalizedStrings.NewStaffForm.Home_Address || 'Home Address'}
            value={street}
            onChange={value => {
              setStreet(value);
              clearError('street');
            }}
            style_input={{ textAlign: 'start' }}
            multiline
            numberOfLines={2}
            error={errors.street}
          />
          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder="e.g. Phase 1, Model Town"
            title="Area / Locality"
            value={areaLocality}
            onChange={value => {
              setAreaLocality(value);
              clearError('areaLocality');
            }}
            error={errors.areaLocality}
          />



          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.Pincode_Placeholder || '400050'
            }
            title={LocalizedStrings.NewStaffForm.Pincode || 'Pincode'}
            value={pincode}
            onChange={value => {
              // Only allow numbers and limit to 6 digits
              const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
              setPincode(numericValue);
              clearError('pincode');
            }}
            keyboardType="number-pad"
            maxLength={6}
            error={errors.pincode}
          />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input
                style_title={{ color: '#8C8D8B', fontSize: 13 }}
                placeholder={LocalizedStrings.NewStaffForm.City || 'Mumbai'}
                title={LocalizedStrings.NewStaffForm.City || 'City'}
                value={city}
                onChange={value => {
                  setCity(value);
                  clearError('city');
                }}
                style_input={{ paddingHorizontal: 6, fontSize: 12.5 }}
                error={errors.city}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Input
                style_title={{ color: '#8C8D8B', fontSize: 13 }}
                placeholder={
                  LocalizedStrings.NewStaffForm.State_Placeholder ||
                  'Maharashtra'
                }
                title={LocalizedStrings.NewStaffForm.State || 'State'}
                value={stateName}
                onChange={value => {
                  setStateName(value);
                  clearError('stateName');
                }}
                style_input={{ paddingHorizontal: 6, fontSize: 12.5 }}
                error={errors.stateName}
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.nextSectionBtn}
            onPress={() => scrollToStep(2)}
          >
            <Typography style={styles.nextSectionText}>
              Next: Role & Salary ↓
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Section 2: Role & Salary */}
        <View
          style={styles.section}
          onLayout={e => {
            sectionYRefs.current[2] = e.nativeEvent.layout.y;
          }}
        >
        <View style={styles.section}>
          <Typography type={Font?.Poppins_SemiBold} style={styles.sectionTitle}>
            Emergency Contact
          </Typography>

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm
                .Emergency_Contact_Name_Placeholder || 'Emergency Contact Name'
            }
            title={
              LocalizedStrings.NewStaffForm.Emergency_Contact_Name ||
              'Emergency Contact Name'
            }
            value={emergencyContactName}
            onChange={value => {
              setEmergencyContactName(value);
              clearError('emergencyContactName');
            }}
            error={errors.emergencyContactName}
          />

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm
                .Emergency_Contact_Number_Placeholder || '9123456780'
            }
            title={
              LocalizedStrings.NewStaffForm.Emergency_Contact_Number ||
              'Emergency Contact Number'
            }
            value={emergencyContactNumber}
            onChange={value => {
              const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
              setEmergencyContactNumber(digitsOnly);
              clearError('emergencyContactNumber');
            }}
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.emergencyContactNumber}
          />


        </View>

        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={ImageConstant.Verify}
              style={{ height: 20, width: 20, marginRight: 8 }}
              resizeMode="contain"
            />
            <Typography
              type={Font?.Poppins_SemiBold}
              style={styles.sectionTitle}
            >
              {LocalizedStrings.NewStaffForm.Work_Details}
            </Typography>
          </View>

          <DropdownComponent
            title={LocalizedStrings.NewStaffForm.Role_Designation || 'Role/Designation (Multi-Select)'}
            placeholder={
              rolesLoading
                ? 'Loading roles...'
                : LocalizedStrings.NewStaffForm.Role_Placeholder || 'Select Roles'
            }
            width={'100%'}
            style_dropdown={{ marginHorizontal: 0 }}
            selectedTextStyleNew={{ marginLeft: 10 }}
            marginHorizontal={0}
            style_title={{ textAlign: 'left' }}
            multiSelect={true}
            selectedValues={roleDesignation}
            onChange={item => {
              const val = item?.value || item?.label;
              if (!val) return;
              setRoleDesignation(prev =>
                Array.isArray(prev)
                  ? (prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
                  : [val]
              );
              clearError('roleDesignation');
            }}
            data={roles}
            disable={rolesLoading}
            error={errors.roleDesignation}
          />
          {Array.isArray(roleDesignation) && roleDesignation.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, marginBottom: 10 }}>
              {roleDesignation.map((r, i) => {
                const rVal = r?.value ?? r?.id ?? r;
                const roleObj = roles.find(rl => String(rl.value) === String(rVal) || String(rl.id) === String(rVal) || rl.label === String(rVal));
                const roleLabel = roleObj?.label || r?.label || String(rVal);
                return (
                  <View key={i} style={{ backgroundColor: '#FFF5F3', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5, marginRight: 8, marginBottom: 6, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D98579' }}>
                    <Typography size={12} color="#D98579" type={Font?.Poppins_Medium}>{roleLabel}</Typography>
                    <TouchableOpacity onPress={() => setRoleDesignation(prev => prev.filter(v => (v?.value ?? v?.id ?? v) !== rVal))} style={{ marginLeft: 6 }}>
                      <Typography size={12} color="#999">✕</Typography>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Skills & Expertise Section */}
          <Typography type={Font?.Poppins_Bold} size={14} style={{ marginTop: 12, marginBottom: 8 }}>
            Skills & Expertise
          </Typography>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
            {['Cooking', 'Cleaning', 'Driving', 'Child Care', 'Elderly Care', 'Pet Care', 'Patient Care', 'Gardening', 'Housekeeping', 'Ironing', 'Washing'].map((skill, idx) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])}
                  style={{
                    backgroundColor: isSelected ? '#D98579' : '#F7F7F7',
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    marginRight: 8,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? '#D98579' : '#E5E5E5',
                  }}
                >
                  <Typography size={12} color={isSelected ? '#FFFFFF' : '#444444'} type={Font?.Poppins_Medium}>
                    {isSelected ? `✓ ${skill}` : skill}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>

          <Date_Picker
            title={LocalizedStrings.NewStaffForm.Joining_Date || 'Joining Date'}
            placeholder="DD-MM-YYYY"
            selected_date={joiningDate}
            onConfirm={date => {
              // Store as Date object or formatted string
              const formattedDate = moment(date).format('YYYY-MM-DD');
              setJoiningDate(formattedDate);
              clearError('joiningDate');
            }}
            allowFutureDates={true}
            error={errors.joiningDate}
          />

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={
              LocalizedStrings.NewStaffForm.Salary_Placeholder || 'e.g. 10000'
            }
            title={LocalizedStrings.NewStaffForm.Salary}
            value={salary}
            onChange={value => {
              setSalary(value);
              clearError('salary');
            }}
            keyboardType="numeric"
            error={errors.salary}
          />

          <Input
            style_title={{ color: '#8C8D8B' }}
            placeholder={'e.g. name@upi'}
            title={'UPI ID'}
            value={upiId}
            onChange={value => setUpiId(value)}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <DropdownComponent
            title={LocalizedStrings.NewStaffForm.Pay_Frequency}
            placeholder={
              LocalizedStrings.NewStaffForm.Select_Frequency ||
              'Select Frequency'
            }
            width={'100%'}
            style_dropdown={{ marginHorizontal: 0 }}
            selectedTextStyleNew={{ marginLeft: 10 }}
            marginHorizontal={0}
            style_title={{ textAlign: 'left' }}
            data={payFrequencyOptions}
            value={payFrequency}
            onChange={item => {
              setPayFrequency(item);
              clearError('payFrequency');
            }}
            error={errors.payFrequency}
          />

          {payFrequency?.value === 'monthly' && (
            <DropdownComponent
              title={'Salary Closing Date'}
              placeholder={'Select closing day of month'}
              width={'100%'}
              style_dropdown={{ marginHorizontal: 0 }}
              selectedTextStyleNew={{ marginLeft: 10 }}
              marginHorizontal={0}
              style_title={{ textAlign: 'left' }}
              data={salaryClosingDateOptions}
              value={salaryClosingDate}
              onChange={item => {
                setSalaryClosingDate(item);
              }}
            />
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.nextSectionBtn}
            onPress={() => scrollToStep(3)}
          >
            <Typography style={styles.nextSectionText}>
              Next: Verification & Schedule ↓
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Section 3: Verification & Schedule */}
        <View
          style={styles.section}
          onLayout={e => {
            sectionYRefs.current[3] = e.nativeEvent.layout.y;
          }}
        >

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 4 }}>
            <Typography
              type={Font?.Poppins_Bold}
              size={14}
            >
              {LocalizedStrings.NewStaffForm.Working_Days || 'Working Schedule'}
            </Typography>
            <TouchableOpacity
              onPress={() => {
                const allDays = workingDaysOptions.map(d => d.value);
                if (workingDays.length === allDays.length) {
                  setWorkingDays([]);
                } else {
                  setWorkingDays(allDays);
                }
              }}
            >
              <Typography size={12} color="#D98579" type={Font?.Poppins_Medium}>
                {workingDays.length === workingDaysOptions.length ? 'Deselect All' : 'Select All'}
              </Typography>
            </TouchableOpacity>
          </View>
          <Typography size={11} color="#888" style={{ marginBottom: 8 }}>
            Selected days will be used for staff attendance & leave tracking.
          </Typography>

          <View style={styles.daysContainer}>
            {workingDaysOptions.map((day, index) => {
              const isSelected = workingDays.includes(day.value);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayChip,
                    isSelected && styles.dayChipSelected,
                  ]}
                  onPress={() => toggleWorkingDay(day.value)}
                >
                  {isSelected && (
                    <Image
                      source={ImageConstant?.check}
                      style={{
                        width: 12,
                        height: 12,
                        tintColor: '#fff',
                        marginRight: 4,
                      }}
                    />
                  )}
                  <Text style={[
                    styles.dayChipText,
                    isSelected && styles.dayChipTextSelected,
                  ]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.workingDays ? (
            <Typography
              textAlign={'right'}
              style={{ color: 'red', fontSize: 12, marginTop: 5 }}
            >
              {errors.workingDays}
            </Typography>
          ) : null}
        </View>



        <View style={styles.section}>
          <Typography type={Font?.Poppins_SemiBold} style={styles.sectionTitle}>
            Languages Spoken
          </Typography>
          <View style={styles.daysContainer}>
            {languagesList.map((lang, index) => {
              const isSelected = selectedLanguages.includes(lang);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                  onPress={() => toggleLanguage(lang)}
                >
                  {isSelected && (
                    <Image
                      source={ImageConstant?.check}
                      style={{
                        width: 12,
                        height: 12,
                        tintColor: '#fff',
                        marginRight: 4,
                      }}
                    />
                  )}
                  <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Typography type={Font?.Poppins_SemiBold} style={styles.sectionTitle}>
            {LocalizedStrings.NewStaffForm.KYC_Documents}
          </Typography>

          {/* Staff Photo - always uploadable */}
          <View style={styles.uploadRowSingle}>
            <UploadBox
              title={LocalizedStrings.NewStaffForm.Staff_Photo}
              icon={ImageConstant.NewCamera}
              styles_container={styles.uploadBoxHalf}
              onPress={() => handleImagePicker('staffPhoto')}
              image={staffPhoto}
            />
          </View>

          {/* Police Clearance & Aadhaar - show read-only if staff already uploaded them */}
          {(!isPlaceholderImage(existingAadharFront) || !isPlaceholderImage(existingPoliceClearance)) ? (
            <>
              {!isPlaceholderImage(existingPoliceClearance) && (
                <View style={styles.readOnlyDocRow}>
                  <Typography type={Font?.Poppins_Medium} style={styles.readOnlyDocLabel}>
                    {LocalizedStrings.NewStaffForm.Police_Clearance_Certificate || 'Police Clearance'}
                  </Typography>
                  <Image
                    source={{ uri: existingPoliceClearance }}
                    style={styles.readOnlyDocImage}
                    resizeMode="cover"
                  />
                </View>
              )}
              <View style={styles.uploadRow}>
                {!isPlaceholderImage(existingAadharFront) ? (
                  <View style={[styles.uploadBox, styles.readOnlyDocContainer]}>
                    <Typography type={Font?.Poppins_Medium} style={styles.readOnlyDocLabel}>
                      {LocalizedStrings.NewStaffForm.Aadhaar_Card_Details || 'Aadhaar Front'}
                    </Typography>
                    <Image
                      source={{ uri: existingAadharFront }}
                      style={styles.readOnlyDocImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <UploadBox
                    title={LocalizedStrings.NewStaffForm.Aadhaar_Card_Details || 'Aadhaar Front'}
                    icon={ImageConstant.Doc}
                    styles_container={styles.uploadBox}
                    onPress={() => handleImagePicker('aadharCard')}
                    image={aadharCard}
                  />
                )}
                {!isPlaceholderImage(existingAadharBack) ? (
                  <View style={[styles.uploadBox, styles.readOnlyDocContainer]}>
                    <Typography type={Font?.Poppins_Medium} style={styles.readOnlyDocLabel}>
                      {'Aadhaar Card Back'}
                    </Typography>
                    <Image
                      source={{ uri: existingAadharBack }}
                      style={styles.readOnlyDocImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <UploadBox
                    title={'Aadhaar Card Back'}
                    icon={ImageConstant.Doc}
                    styles_container={styles.uploadBox}
                    onPress={() => handleImagePicker('aadharBack')}
                    image={aadharBack}
                  />
                )}
              </View>
            </>
          ) : (
            <>
              <View style={styles.uploadRow}>
                <UploadBox
                  title={'Staff Photo'}
                  icon={ImageConstant.person}
                  styles_container={styles.uploadBox}
                  onPress={() => handleImagePicker('staffPhoto')}
                  image={staffPhoto}
                />
                <UploadBox
                  title={LocalizedStrings.NewStaffForm.Police_Clearance_Certificate || 'Police Verification'}
                  icon={ImageConstant.Verify}
                  styles_container={styles.uploadBox}
                  onPress={() => handleImagePicker('policeClearance')}
                  image={policeClearance}
                />
              </View>
              <View style={styles.uploadRow}>
                <UploadBox
                  title={LocalizedStrings.NewStaffForm.Aadhaar_Card_Details || 'Aadhaar Front'}
                  icon={ImageConstant.Doc}
                  styles_container={styles.uploadBox}
                  onPress={() => handleImagePicker('aadharCard')}
                  image={aadharCard}
                />
                <UploadBox
                  title={'Aadhaar Card Back'}
                  icon={ImageConstant.Doc}
                  styles_container={styles.uploadBox}
                  onPress={() => handleImagePicker('aadharBack')}
                  image={aadharBack}
                />
              </View>
            </>
          )}

      </View>
    </View>

      {currentStep === 2 && (
      <View style={styles.bottomButton}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, width: '90%' }}>
          <TouchableOpacity
            onPress={() => setCurrentStep(1)}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#D98579',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography size={15} color="#D98579" type={Font?.Poppins_SemiBold}>
              Back
            </Typography>
          </TouchableOpacity>
          <View style={{ flex: 1.2, height: 48, justifyContent: 'center' }}>
            <Button
              title={
                isEditMode
                  ? LocalizedStrings.NewStaffForm.Update_Staff || 'Update Staff'
                  : LocalizedStrings.NewStaffForm.Add_Staff
              }
              onPress={() => handleSubmit()}
              main_style={{ width: '100%', height: 48, justifyContent: 'center' }}
              style={{ marginVertical: 0, height: 48, borderRadius: 24 }}
              loader={loading}
            />
          </View>
        </View>
      </View>
      )}

      <ImageModal
        showModal={showImageModal}
        title={'Upload Document'}
        close={() => setShowImageModal(false)}
        selected={handleImageSelected}
        document={true}
      />
    </CommanView>
  );
};

export default NewStaffForm;

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Font?.Poppins_SemiBold,
    color: '#1A1A1A',
  },
  uploadRowSingle: {
    alignItems: 'center',
    marginTop: 12,
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  uploadBoxFull: {
    width: '80%',
  },
  uploadBoxHalf: {
    width: '48%',
  },
  uploadBox: {
    flex: 1,
    marginHorizontal: 6,
  },
  readOnlyDocRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  readOnlyDocContainer: {
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#EBEBEA',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
  },
  readOnlyDocLabel: {
    fontSize: 12,
    color: '#8C8D8B',
    marginBottom: 6,
    textAlign: 'center',
  },
  readOnlyDocImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EBEBEA',
    backgroundColor: '#F9F9F9',
  },
  bottomButton: {
    marginTop: 30,
    marginBottom: 30,
    alignItems: 'center',
  },
  buttonStyle: {
    width: '90%',
  },
  docBox: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EBEBEA',
    alignItems: 'center',
  },
  docLink: {
    fontSize: 13,
    color: '#D98579',
    fontFamily: Font.Poppins_SemiBold,
    marginTop: 4,
  },
  docGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  dayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBEBEA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9F9F9',
  },
  dayChipSelected: {
    borderColor: '#D98579',
    backgroundColor: '#D98579',
  },
  dayChipText: {
    fontSize: 13,
    color: '#333',
  },
  dayChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  nextSectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F3',
    borderWidth: 1,
    borderColor: '#D98579',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  nextSectionText: {
    color: '#D98579',
    fontSize: 14,
    fontFamily: Font?.Poppins_SemiBold,
  },
});







