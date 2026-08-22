import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import CommanView from '../../../Component/CommanView';
import Typography from '../../../Component/UI/Typography';
import { Font } from '../../../Constants/Font';
import HeaderForUser from '../../../Component/HeaderForUser';
import Button from '../../../Component/Button';
import { ImageConstant } from '../../../Constants/ImageConstant';
import SimpleModal from './../../../Component/UI/SimpleModal';
import { OtpInput } from 'react-native-otp-entry';
import LocalizedStrings from '../../../Constants/localization';
import SimpleToast from 'react-native-simple-toast';
import { useDispatch } from 'react-redux';
import { userDetails as userDetailsAction } from '../../../Redux/action';
import { POST_FORM_DATA, POST_WITH_TOKEN } from '../../../Backend/Backend';
import { AADHAR_SAVE, AADHAR_VERFIY, ApplicantsStatus } from '../../../Backend/api_routes';

const buildSafeStaffPayload = (baseUser = {}, verifiedUser = {}) => {
  const nextUser = verifiedUser && typeof verifiedUser === 'object' ? verifiedUser : {};
  const prevUser = baseUser && typeof baseUser === 'object' ? baseUser : {};

  return {
    id: nextUser?.id || prevUser?.id,
    user_id: nextUser?.user_id || prevUser?.user_id,
    name: nextUser?.name || prevUser?.name,
    first_name: nextUser?.first_name || prevUser?.first_name,
    last_name: nextUser?.last_name || prevUser?.last_name,
    email: nextUser?.email || prevUser?.email,
    phone_number:
      nextUser?.phone_number ||
      nextUser?.mobile_number ||
      prevUser?.phone_number ||
      prevUser?.mobile_number,
    phone_number_prefix:
      nextUser?.phone_number_prefix ||
      nextUser?.phone_number_country_code ||
      prevUser?.phone_number_prefix ||
      prevUser?.phone_number_country_code,
    gender: nextUser?.gender || prevUser?.gender,
    dob: nextUser?.dob || prevUser?.dob,
    aadhar_number: nextUser?.aadhar_number || prevUser?.aadhar_number,
    aadhar__verify:
      nextUser?.aadhar__verify !== undefined
        ? nextUser?.aadhar__verify
        : prevUser?.aadhar__verify,
    image: nextUser?.image || prevUser?.image,
    upi_id: nextUser?.upi_id || prevUser?.upi_id,
    addresses: Array.isArray(nextUser?.addresses) && nextUser.addresses.length > 0
      ? nextUser.addresses
      : Array.isArray(prevUser?.addresses) && prevUser.addresses.length > 0
        ? prevUser.addresses
        : [],
    user_work_info:
      nextUser?.user_work_info ||
      nextUser?.userWorkInfo ||
      nextUser?.work_info ||
      prevUser?.user_work_info ||
      prevUser?.userWorkInfo ||
      prevUser?.work_info ||
      null,
    kyc_information:
      nextUser?.kyc_information ||
      nextUser?.kycInformation ||
      prevUser?.kyc_information ||
      prevUser?.kycInformation ||
      null,
    aadhar_front:
      nextUser?.aadhar_front ||
      nextUser?.aadhaar_front ||
      prevUser?.aadhar_front ||
      prevUser?.aadhaar_front ||
      null,
    aadhar_back:
      nextUser?.aadhar_back ||
      nextUser?.aadhaar_back ||
      prevUser?.aadhar_back ||
      prevUser?.aadhaar_back ||
      null,
    verification_certificate:
      nextUser?.verification_certificate ||
      prevUser?.verification_certificate ||
      null,
    relation:
      nextUser?.relation ||
      prevUser?.relation ||
      nextUser?.user_work_info?.emergency_contact_relation ||
      prevUser?.user_work_info?.emergency_contact_relation ||
      nextUser?.work_info?.emergency_contact_relation ||
      prevUser?.work_info?.emergency_contact_relation ||
      null,
  };
};

const StaffVerifection = ({ navigation, route }) => {
const dispatch = useDispatch();
const userData = route?.params?.userData;
const adharNumber = route?.params?.adharNumber;
const otpAlreadySent = route?.params?.otpAlreadySent || false;
const pendingApproval = route?.params?.pendingApproval || false;
const applicationId = route?.params?.applicationId || null;
const job_id = route?.params?.job_id || null;
const job_compensation = route?.params?.job_compensation || 0;
const job_title = route?.params?.job_title || '';
const job_compensation_type = route?.params?.job_compensation_type || 'monthly';

  const [otp, setOtp] = useState('');
  const [Verify, setVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const last4 = adharNumber?.slice(-4) || '****';

  useEffect(() => {
    // Auto-send OTP on mount ONLY when not already sent (e.g. from ListingJob flow)
    // When navigated from Aadhar.js, OTP was already sent — skip to avoid double-send
    if (adharNumber && !otpAlreadySent) {
      if (!/^[0-9]{12}$/.test(adharNumber)) {
        setOtpError('Invalid Aadhaar number. Please go back and enter a valid 12-digit Aadhaar number.');
        return;
      }
      const body = {
        aadhar_number: adharNumber,
        is_staff_add: 1,
      };
      const userId = userData?.user_id || userData?.id;
      if (userId) {
        body.user_id = userId;
      }
      POST_FORM_DATA(
        AADHAR_SAVE,
        body,
        () => {
          setResendTimer(30);
        },
        error => {
          let errorMsg = 'Failed to send OTP. Please tap Resend.';
          if (error?.data?.message) errorMsg = error.data.message;
          setOtpError(errorMsg);
          setResendTimer(0);
        },
        () => {
          setOtpError('Network error. Please tap Resend.');
          setResendTimer(0);
        },
      );
    } else if (otpAlreadySent) {
      setResendTimer(30);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtpError('');

    const body = {
      aadhar_number: adharNumber,
      is_staff_add: 1,
    };
    const userId = userData?.user_id || userData?.id;
    if (userId) {
      body.user_id = userId;
    }

    POST_FORM_DATA(
      AADHAR_SAVE,
      body,
      success => {
        setResendTimer(30);
        setOtpError('');
      },
      error => {
        setLoading(false);
        let errorMsg = 'Invalid OTP. Please try again.';
        if (error?.data?.message) {
          errorMsg = error.data.message;
        } else if (error?.data?.error) {
          errorMsg = error.data.error;
        } else if (error?.data?.errors) {
          const errs = error.data.errors;
          errorMsg = Object.values(errs).flat().join('\n');
        } else if (error?.message) {
          errorMsg = error.message;
        } else if (error?.error) {
          errorMsg = error.error;
        }
        
        if (typeof errorMsg !== 'string') {
          try {
            errorMsg = JSON.stringify(errorMsg);
          } catch(e) {
            errorMsg = 'An unknown error occurred';
          }
        }
        setOtpError(errorMsg);
      },
      fail => {
        setOtpError('Network error. Please try again.');
      },
    );
  };

  const handleVerify = () => {
    if (otp.length !== 6) {
      setOtpError(
        LocalizedStrings.AddStaff?.OTP_Placeholders ||
          'Please enter a valid 6-digit OTP',
      );
      return;
    }

    setOtpError('');
    setLoading(true);

    let data = new FormData();
    data.append('otp', String(otp));
    const userId = userData?.user_id || userData?.id;
    if (userId) {
      data.append('user_id', String(userId));
    }
    data.append('aadhar_number', String(adharNumber));
    data.append('is_staff_add', '1');

      POST_FORM_DATA(
      AADHAR_VERFIY,
      data,
      success => {
        setLoading(false);
        if (success?.status === false || success?.success === false) {
          let errorMsg = success?.message || success?.error || 'Invalid OTP. Please try again.';
          setOtpError(errorMsg);
          return;
        }
        const verifiedUser = success?.data?.user || success?.user || null;
        if (verifiedUser && typeof verifiedUser === 'object') {
          dispatch(userDetailsAction(verifiedUser));
        }
        const mergedUserData = buildSafeStaffPayload(userData, verifiedUser);

        const goToNewStaff = () => {
          navigation.navigate('NewStaffFrom', {
            adharNumber: adharNumber,
            userData: mergedUserData,
            job_id,
            job_compensation,
            job_title,
            job_compensation_type,
          });
        };

        // If this came from job approval flow, approve the application AFTER OTP verified
        if (pendingApproval && applicationId) {
          POST_WITH_TOKEN(
            `${ApplicantsStatus}/${applicationId}/status`,
            { application_status: 'accepted' },
            () => goToNewStaff(),
            error => {
              SimpleToast.show(
                error?.data?.message || 'Failed to approve. Please try again from applications.',
                SimpleToast.LONG,
              );
              navigation.goBack();
            },
            () => {
              SimpleToast.show('Network error. Please try again.', SimpleToast.LONG);
              navigation.goBack();
            },
          );
        } else {
          goToNewStaff();
        }
      },
      error => {
        setLoading(false);
        let errorMsg = 'Invalid OTP. Please try again.';
        if (error?.data?.message) {
          errorMsg = error.data.message;
        } else if (error?.data?.error) {
          errorMsg = error.data.error;
        } else if (error?.data?.errors) {
          const errs = error.data.errors;
          errorMsg = Object.values(errs).flat().join('\n');
        } else if (error?.message) {
          errorMsg = error.message;
        } else if (error?.error) {
          errorMsg = error.error;
        }
        
        if (typeof errorMsg !== 'string') {
          try {
            errorMsg = JSON.stringify(errorMsg);
          } catch(e) {
            errorMsg = 'An unknown error occurred';
          }
        }
        setOtpError(errorMsg);
      },
      fail => {
        setLoading(false);
        setOtpError('Something went wrong. Please try again.');
      },
    );
  };

  return (
    <CommanView>
      <HeaderForUser
        title={LocalizedStrings.AddStaff?.title || 'Aadhaar OTP Verification'}
        style_title={styles.headerTitle}
        containerStyle={styles.headerContainer}
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => {
          navigation?.goBack();
        }}
      />
      <View style={styles.centerContainer}>
        <View style={styles.card}>
          <Typography type={Font?.Poppins_SemiBold} style={styles.otpTitle}>
            {LocalizedStrings.AddStaff?.Verify || 'Verify Aadhaar OTP'}
          </Typography>
          <Typography type={Font?.Poppins_Regular} style={styles.otpDesc}>
            {(LocalizedStrings.AddStaff?.Description || 'Enter 6-digit OTP sent to mobile linked with Aadhaar') + (last4 ? ` (ending in ${last4})` : '')}
          </Typography>

          <OtpInput
            numberOfDigits={6}
            focusColor="#D98579"
            onTextChange={text => {
              setOtp(text);
              if (otpError) {
                setOtpError('');
              }
            }}
            textInputProps={{
              keyboardType: 'number-pad',
            }}
            theme={{
              containerStyle: { marginTop: 16, marginBottom: 16 },
              pinCodeContainerStyle: {
                borderWidth: 1,
                borderColor: otpError ? 'red' : '#E5E7EB',
                borderRadius: 10,
                height: 48,
                width: 44,
              },
              pinCodeTextStyle: {
                fontSize: 18,
                fontFamily: Font?.Poppins_Medium,
                color: '#000',
                textAlign: 'center',
              },
            }}
          />

          {/* Error Message */}
          {otpError ? (
            <Typography
              size={12}
              color="red"
              style={{ textAlign: 'center', marginBottom: 10 }}
            >
              {otpError}
            </Typography>
          ) : null}

          <TouchableOpacity
            onPress={handleResend}
            disabled={resendTimer > 0}
            style={{ alignSelf: 'center' }}
          >
            {resendTimer > 0 ? (
              <Typography
                type={Font?.Poppins_Regular}
                size={13}
                color="#999"
                style={{ marginTop: 6, marginBottom: 16 }}
              >
                {LocalizedStrings.AddStaff?.Resend_Text || 'Resend OTP in'} {resendTimer}s
              </Typography>
            ) : (
              <Typography
                type={Font?.Poppins_Regular}
                size={13}
                style={{ marginTop: 6, marginBottom: 16 }}
              >
                {LocalizedStrings.AddStaff?.Resend_Text?.split('?')[0] || 'Didn\'t receive OTP'}?{' '}
                <Typography type={Font?.Poppins_Medium} style={styles.resend}>
                  {LocalizedStrings.AadhaarOTPVerification?.resend || 'Resend'}
                </Typography>
              </Typography>
            )}
          </TouchableOpacity>

          <Button
            onPress={handleVerify}
            title={LocalizedStrings.AddStaff?.Verify_Add_Staff || 'Submit'}
            main_style={styles.buttonStyle}
            icon={ImageConstant?.Arrow}
            loader={loading}
            disabled={loading}
          />

          <Typography type={Font?.Poppins_Regular} style={styles.noteText}>
            We use Aadhaar for identity verification and to prevent fraudulent listings, enhancing trust within the Sahayya community.
          </Typography>
        </View>
      </View>

      <SimpleModal visible={Verify}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ padding: 40 }}>
            <Image
              source={ImageConstant?.ic_success}
              style={{ width: 60, height: 60, resizeMode: 'contain' }}
            />
          </View>
          <Typography
            size={20}
            type={Font?.Poppins_SemiBold}
            textAlign={'center'}
          >
            {LocalizedStrings.StaffAddedSuccess?.Title || 'Success'}
          </Typography>
          <Typography
            size={16}
            type={Font?.Poppins_Regular}
            textAlign={'center'}
            color="#8C8D8B"
            style={{ marginTop: 30 }}
          >
            {LocalizedStrings.StaffAddedSuccess?.Message || 'Staff member added successfully.'}
          </Typography>
          <Button
            title={LocalizedStrings.StaffAddedSuccess?.Done || 'Done'}
            onPress={() => navigation.navigate('TabNavigation')}
            main_style={{ marginTop: 20, width: '100%' }}
            icon={ImageConstant?.Arrow}
          />
        </View>
      </SimpleModal>
    </CommanView>
  );
};

export default StaffVerifection;

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontFamily: Font?.Poppins_SemiBold,
  },
  centerContainer: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  otpTitle: {
    fontSize: 16,
    fontFamily: Font?.Poppins_SemiBold,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  otpDesc: {
    textAlign: 'center',
    color: '#8C8D8B',
    marginTop: 6,
    marginBottom: 10,
    fontSize: 13,
  },
  resend: {
    color: '#D98579',
    fontFamily: Font?.Poppins_SemiBold,
  },
  buttonStyle: {
    width: '100%',
    height: 48,
    borderRadius: 12,
  },
  noteText: {
    fontSize: 12,
    color: '#8C8D8B',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
});



