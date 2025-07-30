'use client';

import { man } from '@/app/image';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaMoneyBillTransfer } from 'react-icons/fa6';
import { ImBook } from 'react-icons/im';
import { IoPeople } from 'react-icons/io5';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Row = {
    key: string;
    name: string;
    status: string;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    denda: string;
};

const columns = [
    { key: 'name', label: 'JUDUL BUKU' },
    { key: 'status', label: 'STATUS' },
    { key: 'tanggal_pinjam', label: 'TANGGAL PINJAM' },
    { key: 'tanggal_kembali', label: 'TANGGAL KEMBALI' },
    { key: 'denda', label: 'DENDA' },
];

function Page() {
    const [jumlahPeminjam, setJumlahPeminjam] = useState(0);
    const [jumlahBuku, setJumlahBuku] = useState(0);
    const [totalDenda, setTotalDenda] = useState(0);
    const [rows, setRows] = useState<Row[]>([]);

    const data = [
        { date: 'May 15', value: 100 },
        { date: 'May 20', value: 80 },
        { date: 'May 25', value: 130 },
        { date: 'May 30', value: 90 },
        { date: 'Jun 05', value: 120 },
        { date: 'Jun 10', value: 110 },
        { date: 'Jun 15', value: 160 },
    ];

    const total = 16234;
    const current = 8445.98;
    const percentage = Math.round((current / total) * 100);


    const dataSideChart = Array.from({ length: 30 }, () => ({
        value: Math.floor(Math.random() * 1000),
    }));

    return (
        <DefaultLayout>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-4">
                    <div className="relative bg-primaryGreen w-full p-3 rounded-xl overflow-hidden">
                        {/* Decorative Circles */}
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/35 opacity-30 rounded-full z-0"></div>
                        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white/35 opacity-30 rounded-full z-0"></div>
                        <div className="absolute bottom-0 right-5 w-24 h-24 bg-white/35 opacity-30 rounded-full z-0"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/35 opacity-20 rounded-full z-0"></div>

                        {/* Header Content */}
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
                            <div className="flex justify-center items-center">
                                <div>
                                    <h1 className="font-bold text-xl text-white">Hai admin, selamat datang  👋</h1>
                                    <p className="text-sm text-white">Mari mulai memanagement perpustakaan ini</p>
                                </div>
                            </div>

                            <div className="flex justify-center items-center order-1 lg:order-2">
                                <div className="h-40">
                                    <Image className="w-full h-full" src={man} alt="dashboard" />
                                </div>
                            </div>
                        </div>
                    </div>



                    <div className="p-4 rounded-xl shadow-lg w-full h-[300px] mt-5">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#1a1a1a" />
                                <XAxis dataKey="date" stroke="#666" />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#222', border: 'none' }}
                                    labelStyle={{ color: '#fff' }}
                                    cursor={{ stroke: '#00ff88', strokeWidth: 1 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#00ff88"
                                    strokeWidth={3}
                                    dot={{ r: 4, stroke: '#00ff88', strokeWidth: 2, fill: '#0d0d0d' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="col-span-2 rounded-xl ">

                    <div className="bg-primaryGreen rounded-xl p-4 text-white shadow-md w-full ">
                        <p className="text-sm text-gray-200">Credit Bank Debt</p>
                        <h2 className="text-3xl font-bold">${current.toLocaleString()}</h2>
                        <p className="text-sm text-gray-300">/ {total.toLocaleString()}</p>
                        <p className="mt-2 text-sm text-gray-200">{percentage}% completed</p>
                        <div className="mt-2 flex gap-[2px]">
                            {Array.from({ length: 100 }, (_, i) => (
                                <div
                                    key={i}
                                    className={`h-2 w-[2px] rounded-sm ${i < percentage ? 'bg-white' : 'bg-gray-700'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-primaryGreen rounded-xl p-4 text-white shadow-md w-full mt-5" >
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm text-gray-400">Your assets</p>
                            <div className="text-xs text-red-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full" />
                                -9%
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">$11,239.00</h2>
                        <ResponsiveContainer width="100%" height={60}>
                            <BarChart data={dataSideChart}>
                                <Bar dataKey="value" fill="#ff5c5c" radius={[4, 4, 0, 0]} barSize={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>


        </DefaultLayout>
    );
}

export default Page;
