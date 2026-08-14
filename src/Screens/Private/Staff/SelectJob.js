import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import CommanView from '../../../Component/CommanView';
import HeaderForUser from '../../../Component/HeaderForUser';
import { ImageConstant } from '../../../Constants/ImageConstant';
import Button from '../../../Component/Button';
import Typography from '../../../Component/UI/Typography';
import { Font } from '../../../Constants/Font';
import { GET_WITH_TOKEN } from '../../../Backend/Backend';
import { Joblist_Admin, ListJob } from '../../../Backend/api_routes';
import { useSelector } from 'react-redux';
import SimpleToast from 'react-native-simple-toast';

const SelectJob = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const userDetail = useSelector(state => state?.userDetails);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    const jobsRoute = userDetail?.user_role_id ? Joblist_Admin : ListJob;
    GET_WITH_TOKEN(
      jobsRoute,
      success => {
        setLoading(false);
        const rawData = success?.data;
        const jobList = Array.isArray(rawData) ? rawData : (rawData?.data || []);
        setJobs(Array.isArray(jobList) ? jobList : []);
      },
      () => {
        setLoading(false);
        setJobs([]);
      },
      () => {
        setLoading(false);
        setJobs([]);
      },
    );
  }, [userDetail?.user_role_id]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSelectJob = job => {
    navigation.navigate('Aadhar', {
      job_id: job.id,
      job_compensation: job.compensation || job.expected_compensation || 0,
      job_title: job.title || '',
      job_compensation_type: job.compensation_type || 'monthly',
    });
  };

  const formatPrice = price => {
    if (!price || price === '0' || price === '0.00') return 'Not specified';
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  const renderJobCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Typography type={Font.Poppins_SemiBold} style={styles.jobTitle}>
          {item.title || 'Untitled Job'}
        </Typography>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'open' ? '#E8F5E9' : '#FFF3E0' }
        ]}>
          <Typography
            type={Font.Poppins_Medium}
            style={[
              styles.statusText,
              { color: item.status === 'open' ? '#4CAF50' : '#FF9800' }
            ]}
          >
            {(item.status || 'open').charAt(0).toUpperCase() + (item.status || 'open').slice(1)}
          </Typography>
        </View>
      </View>

      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <Typography type={Font.Poppins_Regular} style={styles.detailLabel}>Salary:</Typography>
          <Typography type={Font.Poppins_Medium} style={styles.detailValue}>
            {formatPrice(item.compensation || item.expected_compensation)}
            {item.compensation_type ? ` / ${item.compensation_type}` : ''}
          </Typography>
        </View>
        {item.city && item.state && (
          <View style={styles.detailRow}>
            <Typography type={Font.Poppins_Regular} style={styles.detailLabel}>Location:</Typography>
            <Typography type={Font.Poppins_Regular} style={styles.detailValue}>
              {item.city}, {item.state}
            </Typography>
          </View>
        )}
        {item.commitment_type && (
          <View style={styles.detailRow}>
            <Typography type={Font.Poppins_Regular} style={styles.detailLabel}>Type:</Typography>
            <Typography type={Font.Poppins_Regular} style={styles.detailValue}>
              {item.commitment_type}
            </Typography>
          </View>
        )}
      </View>

      {item.description ? (
        <Typography type={Font.Poppins_Regular} style={styles.description} numberOfLines={2}>
          {item.description}
        </Typography>
      ) : null}

      <Button
        title="Select This Job"
        main_style={styles.selectButton}
        onPress={() => handleSelectJob(item)}
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Typography type={Font.Poppins_SemiBold} style={styles.emptyTitle}>
        No Job Postings Found
      </Typography>
      <Typography type={Font.Poppins_Regular} style={styles.emptySubtitle}>
        You need to post at least one job before adding staff for it.
      </Typography>
      <Button
        title="Post a Job"
        main_style={styles.postJobButton}
        onPress={() => navigation.navigate('PostNewJob')}
      />
    </View>
  );

  return (
    <CommanView>
      <HeaderForUser
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation.goBack()}
        title="Select Job for Staff"
        style_title={{ fontSize: 18 }}
      />

      <View style={styles.container}>
        <Typography type={Font.Poppins_Medium} style={styles.subtitle}>
          Choose which job you want to assign staff to
        </Typography>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D98579" />
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={item => String(item.id)}
          renderItem={renderJobCard}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </CommanView>
  );
};

export default SelectJob;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderColor: '#EBEBEA',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
  },
  jobDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#888',
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  description: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  selectButton: {
    backgroundColor: '#D98579',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  postJobButton: {
    backgroundColor: '#D98579',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
});
