// app/loading.tsx
'use client';

import dynamic from 'next/dynamic';
import loadingAnimation from './../../public/animate.json';

const Player = dynamic(
    () => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player),
    {
        ssr: false, // Nonaktifkan SSR untuk komponen ini
        loading: () => <div className="h-[200px] w-[200px]" /> // Fallback selama loading
    }
);

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