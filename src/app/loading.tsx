// app/loading.tsx
'use client';

import { Player } from '@lottiefiles/react-lottie-player';
import loadingAnimation from './../../public/animate.json'; // import langsung jika pakai webpack

const Loading = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-white">
            <Player
                autoplay
                loop
                src={loadingAnimation}
                style={{ height: 200, width: 200 }}
            />
        </div>
    );
};

export default Loading;
