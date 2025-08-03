'use client';

import Link from 'next/link';
import { Player } from '@lottiefiles/react-lottie-player';
import notFoundAnimation from '../../public/404.json';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-center px-4">
            <Player
                autoplay
                loop
                src={notFoundAnimation}
                style={{ height: 400, width: 500 }}
            />
            <h1 className="text-4xl font-bold text-gray-800 mt-2">Oops! Halaman tidak ditemukan</h1>
            <p className="text-gray-600 mt-2 mb-6">
                Sepertinya kamu tersesat. Halaman yang kamu cari tidak tersedia.
            </p>
            <Link
                href="/"
                className="px-6 py-2 bg-primaryGreen text-white rounded-full hover:bg-secondaryGreen transition-all duration-300 shadow-lg"
            >
                Kembali ke Beranda
            </Link>
        </div>
    );
}
