import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';

// Adjust path based on asset location
const videoSource = require('../../assets/video/clipofbegininggamemode.mp4');

export default function Chapter1VideoScreen() {
    const router = useRouter();

    const player = useVideoPlayer(videoSource, player => {
        player.loop = false;
        player.play();
    });

    // When the video ends, navigate to the tasks tab
    player.addListener('playToEnd', () => {
        router.replace('/(tabs)/tasks');
    });

    return (
        <View style={styles.container}>
            <View style={styles.videoContainer}>
                <VideoView
                    style={styles.video}
                    player={player}
                    allowsFullscreen
                    allowsPictureInPicture
                    contentFit="cover"
                    nativeControls={false}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    video: {
        flex: 1,
        width: '100%',
        height: '100%',
        // Scale the video slightly up to hide the bottom right watermark if it exists
        transform: [{ scale: 1.05 }],
    },
});
