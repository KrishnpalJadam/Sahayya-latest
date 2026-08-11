import { StyleSheet, View, ScrollView } from 'react-native';
import React from 'react';
import CommanView from '../../Component/CommanView';
import HeaderForUser from '../../Component/HeaderForUser';
import Typography from '../../Component/UI/Typography';
import { Font } from '../../Constants/Font';
import { ImageConstant } from '../../Constants/ImageConstant';
import { trainingVideos } from '../../Constants/Data';
import TrainingVideoCard from '../../Component/UI/TrainingVideoCard';

const TrainingVideos = ({ navigation }) => {
  return (
    <CommanView>
      <HeaderForUser
        title={'Training Videos'}
        style_title={{ fontSize: 18 }}
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Typography type={Font.Poppins_Regular} size={13} color="#666" style={styles.intro}>
          Watch these short guides to learn how to use the app, stay safe and
          provide the best care. Tick the box once you have watched a video.
        </Typography>
        {trainingVideos.map(video => (
          <TrainingVideoCard
            key={video.id}
            title={video.title}
            subtitle={video.subtitle}
            image={video.image || ImageConstant?.ic_help}
          />
        ))}
      </ScrollView>
    </CommanView>
  );
};

export default TrainingVideos;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  intro: {
    marginTop: 16,
    lineHeight: 20,
  },
});
