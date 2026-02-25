import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';

// Make sure to adjust this path to match your asset location
const videoSource = require('../../assets/video/Animate_this_to_202602251153_udjjg.mp4');

export default function IntroVideoScreen() {
    const router = useRouter();

    const player = useVideoPlayer(videoSource, player => {
        player.loop = false;
        player.play();
    });

    // When the video ends, navigate to the next screen (select-mode)
    player.addListener('playToEnd', () => {
        router.replace('/(auth)/select-mode');
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
        overflow: 'hidden', // hides any parts that scale outside the container
    },
    video: {
        flex: 1,
        width: '100%',
        height: '100%',
        // Scale the video slightly up to hide the bottom right watermark
        transform: [{ scale: 1.05 }],
    },
});
