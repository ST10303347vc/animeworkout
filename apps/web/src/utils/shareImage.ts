import { toPng } from 'html-to-image';

export const shareElementAsImage = async (elementId: string, fileName: string = 'limit-break-stat.png') => {
    try {
        const node = document.getElementById(elementId);
        if (!node) {
            console.error('Element not found');
            return;
        }

        // We temporarily add a style to ensure background isn't transparent if it relies on body background
        const dataUrl = await toPng(node, {
            quality: 0.95,
            backgroundColor: '#09090b', // zinc-950, standard app background
            style: {
                transform: 'scale(1)', // Fix any scaling issues
                margin: '0',
            }
        });

        // Use Web Share API if available (Mobile), otherwise fallback to download (Desktop)
        if (navigator.share) {
            try {
                // Convert DataURL to Blob to File for native sharing
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const file = new File([blob], fileName, { type: 'image/png' });

                await navigator.share({
                    title: 'My Limit Break Stats',
                    text: 'Check out my power level in Limit Break!',
                    files: [file],
                });
            } catch (err) {
                console.log('User cancelled share or share failed', err);
                downloadImage(dataUrl, fileName);
            }
        } else {
            // Fallback: Download image
            downloadImage(dataUrl, fileName);
        }
    } catch (error) {
        console.error('Failed to generate image', error);
    }
};

const downloadImage = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
};
