import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import Video from 'react-native-video';
import CommanView from '../../Component/CommanView';
import HeaderForUser from '../../Component/HeaderForUser';
import Typography from '../../Component/UI/Typography';
import {Font} from '../../Constants/Font';
import {ImageConstant} from '../../Constants/ImageConstant';
import {GET_WITH_TOKEN, API} from '../../Backend/Backend';
import {TrainingVideosList} from '../../Backend/api_routes';
import {useIsFocused} from '@react-navigation/native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Convert YouTube URL to embeddable URL
const getYouTubeEmbedUrl = url => {
  if (!url) return null;
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
  const videoId = watchMatch?.[1] || shortMatch?.[1] || embedMatch?.[1];
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }
  return url;
};

// Convert Vimeo URL to embeddable URL
const getVimeoEmbedUrl = url => {
  if (!url) return null;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return url;
};

const getVideoSource = video => {
  // If uploaded file
  if (video.video_file) {
    const baseUrl = API.replace(/\/api\/?$/, '/');
    return `${baseUrl}storage/videos/${video.video_file}`;
  }
  // If URL
  return video.video_url || null;
};

const isYouTube = url => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const isVimeo = url => {
  if (!url) return false;
  return url.includes('vimeo.com');
};

const isDirectMp4 = url => {
  if (!url) return false;
  return url.includes('.mp4') || url.includes('storage/videos/');
};

const TrainingVideoCard = ({title, subtitle, onPress, index, sourceType}) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.cardLeft}>
      <View style={styles.playCircle}>
        <Typography type={Font.Poppins_Bold} size={14} color="#fff">
          {index + 1}
        </Typography>
      </View>
    </View>
    <View style={styles.cardContent}>
      <Typography type={Font.Poppins_SemiBold} size={14} color="#111">
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          type={Font.Poppins_Regular}
          size={12}
          color="#666"
          style={{marginTop: 2}}>
          {subtitle}
        </Typography>
      ) : null}
    </View>
    <View style={styles.cardRight}>
      {sourceType === 'upload' && (
        <View style={styles.uploadBadge}>
          <Typography type={Font.Poppins_Medium} size={10} color="#fff">
            MP4
          </Typography>
        </View>
      )}
      <Typography type={Font.Poppins_Medium} size={12} color="#D98C79">
        Watch
      </Typography>
    </View>
  </TouchableOpacity>
);

const TrainingVideos = ({navigation}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const isFocused = useIsFocused();

  const fetchVideos = useCallback(() => {
    GET_WITH_TOKEN(
      TrainingVideosList,
      success => {
        const data = success?.data;
        setVideos(Array.isArray(data) ? data : []);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchVideos();
    }
  }, [isFocused, fetchVideos]);

  const renderVideoPlayer = () => {
    if (!selectedVideo) return null;

    const url = getVideoSource(selectedVideo);

    // Uploaded MP4 — use native Video player
    if (selectedVideo.video_file && isDirectMp4(url)) {
      return (
        <Modal
          visible={!!selectedVideo}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedVideo(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setSelectedVideo(null)}
                style={styles.closeBtn}>
                <Typography
                  type={Font.Poppins_SemiBold}
                  size={16}
                  color="#D98C79">
                  Close
                </Typography>
              </TouchableOpacity>
              <Typography
                type={Font.Poppins_SemiBold}
                size={15}
                color="#111"
                style={{flex: 1, textAlign: 'center'}}>
                {selectedVideo.title}
              </Typography>
              <View style={{width: 60}} />
            </View>

            <View style={styles.videoContainer}>
              <Video
                source={{uri: url}}
                style={styles.videoPlayer}
                controls={true}
                resizeMode="contain"
                paused={false}
                repeat={false}
              />
            </View>

            {selectedVideo.subtitle ? (
              <ScrollView style={styles.modalBody}>
                <Typography type={Font.Poppins_Regular} size={14} color="#555">
                  {selectedVideo.subtitle}
                </Typography>
              </ScrollView>
            ) : null}
          </View>
        </Modal>
      );
    }

    // YouTube / Vimeo / Other URL — use WebView
    let embedUrl = null;
    if (isYouTube(url)) {
      embedUrl = getYouTubeEmbedUrl(url);
    } else if (isVimeo(url)) {
      embedUrl = getVimeoEmbedUrl(url);
    } else {
      embedUrl = url;
    }

    return (
      <Modal
        visible={!!selectedVideo}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedVideo(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setSelectedVideo(null)}
              style={styles.closeBtn}>
              <Typography
                type={Font.Poppins_SemiBold}
                size={16}
                color="#D98C79">
                Close
              </Typography>
            </TouchableOpacity>
            <Typography
              type={Font.Poppins_SemiBold}
              size={15}
              color="#111"
              style={{flex: 1, textAlign: 'center'}}>
              {selectedVideo.title}
            </Typography>
            <View style={{width: 60}} />
          </View>

          <View style={styles.videoContainer}>
            {embedUrl ? (
              <WebView
                source={{uri: embedUrl}}
                style={styles.webview}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                allowsFullscreenVideo={true}
                originWhitelist={['*']}
              />
            ) : (
              <View style={styles.noVideo}>
                <Typography size={14} color="#999" textAlign="center">
                  Video not available
                </Typography>
              </View>
            )}
          </View>

          {selectedVideo.subtitle ? (
            <ScrollView style={styles.modalBody}>
              <Typography type={Font.Poppins_Regular} size={14} color="#555">
                {selectedVideo.subtitle}
              </Typography>
            </ScrollView>
          ) : null}
        </View>
      </Modal>
    );
  };

  return (
    <CommanView>
      <HeaderForUser
        title={'Training Videos'}
        style_title={{fontSize: 18}}
        source_arrow={ImageConstant?.BackArrow}
        onPressLeftIcon={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D98C79" />
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Typography size={14} color="#999" textAlign="center">
            No training videos available yet.
          </Typography>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Typography
            type={Font.Poppins_Regular}
            size={13}
            color="#666"
            style={styles.intro}>
            Watch these short guides to learn how to use the app, stay safe and
            provide the best care.
          </Typography>
          {videos.map((video, index) => {
            const url = getVideoSource(video);
            const sourceType = video.video_file
              ? 'upload'
              : isYouTube(url)
              ? 'youtube'
              : isVimeo(url)
              ? 'vimeo'
              : 'url';
            return (
              <TrainingVideoCard
                key={video.id}
                title={video.title}
                subtitle={video.subtitle}
                index={index}
                sourceType={sourceType}
                onPress={() => setSelectedVideo(video)}
              />
            );
          })}
        </ScrollView>
      )}

      {renderVideoPlayer()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    marginTop: 12,
    padding: 12,
  },
  cardLeft: {
    marginRight: 12,
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D98C79',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardRight: {
    marginLeft: 8,
    alignItems: 'flex-end',
  },
  uploadBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeBtn: {
    width: 60,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (9 / 16),
    backgroundColor: '#000',
  },
  videoPlayer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  noVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 16,
  },
});
