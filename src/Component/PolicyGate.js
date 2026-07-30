import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GET_WITH_TOKEN, POST_WITH_TOKEN } from '../Backend/Backend';
import { PolicyStatus, PolicyAccept } from '../Backend/api_routes';
import TermsAcceptanceModal from './TermsAcceptanceModal';

const POLICY_ACCEPTED_KEY = 'policy_accepted_v1';

const PolicyGate = ({ children }) => {
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  const checkPolicyStatus = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(POLICY_ACCEPTED_KEY);
      if (cached === 'true') {
        setIsChecking(false);
        return;
      }
    } catch (e) {
      // AsyncStorage read failed, continue to API check
    }

    GET_WITH_TOKEN(
      PolicyStatus,
      (success) => {
        const policies = success?.data || [];
        const pendingPolicies = policies.filter(p => !p.accepted);
        if (pendingPolicies.length > 0) {
          setNeedsAcceptance(true);
        } else {
          AsyncStorage.setItem(POLICY_ACCEPTED_KEY, 'true').catch(() => {});
        }
        setIsChecking(false);
      },
      () => {
        setIsChecking(false);
      },
      () => {
        setIsChecking(false);
      },
    );
  }, []);

  useEffect(() => {
    checkPolicyStatus();
  }, [checkPolicyStatus]);

  const handleAccept = useCallback(() => {
    setIsAccepting(true);

    const acceptPolicy = (type) => {
      return new Promise((resolve, reject) => {
        POST_WITH_TOKEN(
          PolicyAccept,
          { policy_type: type },
          (success) => resolve(success),
          (error) => reject(error),
          () => reject(new Error('Network error')),
        );
      });
    };

    Promise.all([
      acceptPolicy('terms_and_conditions'),
      acceptPolicy('privacy_policy'),
    ]).then(() => {
      AsyncStorage.setItem(POLICY_ACCEPTED_KEY, 'true').catch(() => {});
      setNeedsAcceptance(false);
      setIsAccepting(false);
    }).catch(() => {
      setIsAccepting(false);
    });
  }, []);

  if (isChecking) {
    return null;
  }

  return (
    <>
      {children}
      <TermsAcceptanceModal
        visible={needsAcceptance}
        onAccept={handleAccept}
        isLoading={isAccepting}
      />
    </>
  );
};

export default PolicyGate;
