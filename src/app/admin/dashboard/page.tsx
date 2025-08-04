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
        { date: 'Juli 15', value: 100 },
    ];

    const total = 16234;
    const current = 8445.98;
    const percentage = Math.round((current / total) * 100);


    const dataSideChart = Array.from({ length: 30 }, () => ({
        value: Math.floor(Math.random() * 1000),
    }));

    return (
        <DefaultLayout>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-0 md:gap-6">
                <div className="md:col-span-4 ">
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
                                    <p className="text-sm text-white">Mari mulai memanagement cash flow ini</p>
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

                <div className="col-span-2 space-y-4 md:space-y-6">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300  flex flex-col group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-emerald-100">Total Saldo Masuk</p>
                                <div className="flex items-end gap-2 mt-2">
                                    <h2 className="text-4xl font-bold">${current}</h2>
                                    <p className="text-lg text-emerald-100 mb-1">/ {total}</p>
                                </div>
                            </div>
                            <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-emerald-100">Progress</span>
                                <span className="text-sm font-bold">{percentage}%</span>
                            </div>
                            <div className="relative pt-1">
                                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-white/20">
                                    <div
                                        style={{ width: `${percentage}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-white transition-all duration-500 ease-out"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Saldo Keluar Card - Responsive */}
                    <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3 md:mb-4">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <p className="text-xs md:text-sm font-medium text-rose-100">Total Saldo Keluar</p>
                                    <div className="text-xs px-2 py-1 bg-white/20 rounded-full flex items-center gap-1 w-fit">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                        </svg>
                                        <span>9%</span>
                                    </div>
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">$11,239.00</h2>
                            </div>
                            <div className="flex justify-end sm:block">
                                <div className="bg-white/10 p-1 md:p-2 rounded-lg w-fit">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="mt-1 md:mt-2">
                            <ResponsiveContainer width="100%" height={60}>
                                <BarChart data={dataSideChart}>
                                    <defs>
                                        <linearGradient id="colorRedBar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff8a8a" stopOpacity={0.9} />
                                            <stop offset="95%" stopColor="#ff5252" stopOpacity={0.9} />
                                        </linearGradient>
                                    </defs>
                                    <Bar
                                        dataKey="value"
                                        fill="url(#colorRedBar)"
                                        radius={[4, 4, 0, 0]}
                                        barSize={6}
                                        animationDuration={2000}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>


        </DefaultLayout>
    );
}

export default Page;
