'use client';

import { getSumaryMounth, getSummaryPerMounth, getAllJournalEntries } from '@/api/method';
import { man } from '@/app/image';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import { formatRupiah } from '@/utils/helper';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaMoneyBillTransfer } from 'react-icons/fa6';
import { ImBook } from 'react-icons/im';
import { IoPeople } from 'react-icons/io5';
import { BiTrendingDown, BiTrendingUp } from 'react-icons/bi';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { log } from 'util';

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
    const [cart, setCart] = useState([])
    const [monthlyData, setMonthlyData] = useState({} as any);
    const [journalData, setJournalData] = useState([] as any);
    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [chartData, setChartData] = useState([] as any);

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

    const target = 10_000_000;
    const current = monthlyData?.income ?? 0;
    const percentage = Math.round((current / target) * 100);



    const dataSideChart = Array.from({ length: 30 }, () => ({
        value: Math.floor(Math.random() * 1000),
    }));

    const fetchData = async () => {
        try {
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();

            // Fetch data tahunan
            // ambil tahun sekarang
            await getSummaryPerMounth(currentYear, (res: any) => {
                const income = res.data.income;
                const expense = res.data.expense;

                const merged = income.map((item: any, index: number) => ({
                    date: item.date,
                    income: item.total,
                    expense: expense[index]?.total || 0,
                }));

                setCart(merged); // <== data ini dipakai untuk chart
            });

            // Fetch data bulanan
            await getSumaryMounth(currentMonth, currentYear, (res: any) => {
                setMonthlyData(res); // <-- data bulanan, bisa untuk card ringkasan
            });

            // Fetch journal entries for debit/credit data
            const journalResult = await getAllJournalEntries();
            if (journalResult && journalResult.data && journalResult.data.journalEntries) {
                const entries = journalResult.data.journalEntries.filter((entry: any) => entry.status === 'posted');
                setJournalData(entries);

                // Calculate totals
                let debitTotal = 0;
                let creditTotal = 0;
                const monthlyTransactionData: any = {};

                entries.forEach((entry: any) => {
                    entry.entries.forEach((journalEntry: any) => {
                        debitTotal += journalEntry.debit;
                        creditTotal += journalEntry.credit;

                        // Group by month for chart
                        const date = new Date(entry.transaction_date);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        const monthName = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
                        
                        if (!monthlyTransactionData[monthKey]) {
                            monthlyTransactionData[monthKey] = { 
                                month: monthName, 
                                debit: 0, 
                                credit: 0 
                            };
                        }
                        monthlyTransactionData[monthKey].debit += journalEntry.debit;
                        monthlyTransactionData[monthKey].credit += journalEntry.credit;
                    });
                });

                setTotalDebit(debitTotal);
                setTotalCredit(creditTotal);
                setChartData(Object.values(monthlyTransactionData).sort((a: any, b: any) => {
                    const dateA = new Date(a.month);
                    const dateB = new Date(b.month);
                    return dateA.getTime() - dateB.getTime();
                }));
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };




    useEffect(() => {
        fetchData();
    }, []);

    console.log(cart);
    console.log(monthlyData);

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



                    <div className="p-4 rounded-xl shadow-lg w-full h-[300px] mt-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cart}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eee" />
                                <XAxis dataKey="date" stroke="#666" />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#222', border: 'none' }}
                                    labelStyle={{ color: '#fff' }}
                                    cursor={{ stroke: '#8884d8', strokeWidth: 1 }}
                                    formatter={(value: any) =>
                                        new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            minimumFractionDigits: 0,
                                        }).format(value)
                                    }
                                />

                                {/* Area Hijau */}
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    fill="url(#colorIncome)"
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 4 }}
                                    name="Pemasukan"
                                />

                                {/* Area Biru */}
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#FB4141"
                                    strokeWidth={3}
                                    fill="url(#colorExpense)"
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 4 }}
                                    name="Pengeluaran"
                                />

                                {/* Gradient Fill */}
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FB4141" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#FB4141" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>


                    </div>
                </div>

                <div className="col-span-2 gap-7 mt-7 md:mt-0 md:gap-0 flex flex-col items-stretch justify-between">
                    {/* Debit Card */}
                    <div className="h-[240px] bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-blue-100">Total Debit</p>
                                <div className="flex items-end gap-2 mt-2">
                                    <h2 className="text-4xl font-bold">{formatRupiah(totalDebit)}</h2>
                                </div>
                            </div>
                            <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-all">
                                <BiTrendingUp className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="mt-6 flex-grow">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <Line
                                        type="monotone"
                                        dataKey="debit"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                        animationDuration={2000}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Credit Card */}
                    <div className="h-[240px] bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-purple-100">Total Credit</p>
                                <div className="flex items-end gap-2 mt-2">
                                    <h2 className="text-4xl font-bold">{formatRupiah(totalCredit)}</h2>
                                </div>
                            </div>
                            <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-all">
                                <BiTrendingDown className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="mt-6 flex-grow">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <Line
                                        type="monotone"
                                        dataKey="credit"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                        animationDuration={2000}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>


        </DefaultLayout>
    );
}

export default Page;
