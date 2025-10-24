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
            console.log('Journal Result:', journalResult);
            
            if (journalResult && journalResult.data && journalResult.data.journalEntries) {
                const entries = journalResult.data.journalEntries.filter((entry: any) => entry.status === 'posted');
                console.log('Filtered entries:', entries);
                setJournalData(entries);

                // Calculate totals
                let debitTotal = 0;
                let creditTotal = 0;
                const dailyTransactionData: any = {};

                // Sort entries by transaction date
                const sortedEntries = entries.sort((a: any, b: any) => 
                    new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
                );

                sortedEntries.forEach((entry: any) => {
                    const date = new Date(entry.transaction_date);
                    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                    const dateLabel = date.toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short' 
                    });
                    
                    if (!dailyTransactionData[dateKey]) {
                        dailyTransactionData[dateKey] = { 
                            date: dateLabel,
                            fullDate: dateKey,
                            debit: 0, 
                            credit: 0,
                            balance: 0
                        };
                    }

                    entry.entries.forEach((journalEntry: any) => {
                        console.log('Processing journal entry:', {
                            date: dateKey,
                            account: journalEntry.account?.name,
                            debit: journalEntry.debit,
                            credit: journalEntry.credit
                        });
                        
                        debitTotal += journalEntry.debit;
                        creditTotal += journalEntry.credit;
                        dailyTransactionData[dateKey].debit += journalEntry.debit;
                        dailyTransactionData[dateKey].credit += journalEntry.credit;
                    });
                });

                console.log('Daily transaction data before balance calculation:', dailyTransactionData);

                // Calculate balance for each day
                const chartDataWithBalance = Object.values(dailyTransactionData)
                    .sort((a: any, b: any) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
                    .map((item: any) => {
                        // Calculate the balance for this specific day
                        const dailyBalance = item.debit - item.credit;
                        console.log(`Date: ${item.date}, Debit: ${item.debit}, Credit: ${item.credit}, Daily Balance: ${dailyBalance}`);
                        return {
                            ...item,
                            balance: dailyBalance,
                            dailyNet: dailyBalance
                        };
                    });

                console.log('Chart data:', chartDataWithBalance);
                
                // If no daily data, create a single point with total balance
                if (chartDataWithBalance.length === 0 && (debitTotal > 0 || creditTotal > 0)) {
                    const totalBalance = debitTotal - creditTotal;
                    const today = new Date();
                    const todayLabel = today.toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short' 
                    });
                    
                    setChartData([{
                        date: todayLabel,
                        fullDate: today.toISOString().split('T')[0],
                        debit: debitTotal,
                        credit: creditTotal,
                        balance: totalBalance,
                        dailyNet: totalBalance
                    }]);
                } else {
                    setChartData(chartDataWithBalance);
                }
                
                setTotalDebit(debitTotal);
                setTotalCredit(creditTotal);
            } else {
                console.log('No journal data found or unexpected structure');
                // Set empty data for chart
                setChartData([]);
                setTotalDebit(0);
                setTotalCredit(0);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };




    useEffect(() => {
        fetchData();
    }, []);

    console.log('Cart data:', cart);
    console.log('Monthly data:', monthlyData);
    console.log('Chart data:', chartData);
    console.log('Journal data:', journalData);

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



                    <div className="p-2 sm:p-4 rounded-xl shadow-lg w-full h-[250px] sm:h-[300px] mt-10">
                        <h3 className="text-sm sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-4">Saldo Transaksi Harian</h3>
                        {chartData && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#666" 
                                        fontSize={12}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis 
                                        stroke="#666"
                                        fontSize={12}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => 
                                            new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            }).format(value).replace('Rp', '')
                                        }
                                    />
                                    <Tooltip
                                        contentStyle={{ 
                                            backgroundColor: '#222', 
                                            border: 'none',
                                            fontSize: '12px',
                                            padding: '8px'
                                        }}
                                        labelStyle={{ 
                                            color: '#fff',
                                            fontSize: '12px'
                                        }}
                                        cursor={{ stroke: '#8884d8', strokeWidth: 1 }}
                                        formatter={(value: any, name: string) => {
                                            // Only show debit and credit in tooltip
                                            if (name === 'debit' || name === 'credit') {
                                                return [
                                                    new Intl.NumberFormat('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 0,
                                                    }).format(value),
                                                    name === 'debit' ? 'Debit' : 'Credit'
                                                ];
                                            }
                                            return null;
                                        }}
                                        labelFormatter={(label, payload) => {
                                            if (payload && payload.length > 0) {
                                                const data = payload[0].payload;
                                                return `${label}`;
                                            }
                                            return label;
                                        }}
                                    />

                                    {/* Line untuk Debit */}
                                    <Line
                                        type="monotone"
                                        dataKey="debit"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                        name="Debit"
                                    />

                                    {/* Line untuk Credit */}
                                    <Line
                                        type="monotone"
                                        dataKey="credit"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                        name="Credit"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="text-gray-400 text-4xl mb-2">📊</div>
                                    <p className="text-gray-500">Belum ada data transaksi</p>
                                    <p className="text-sm text-gray-400">Data akan muncul setelah ada transaksi yang diposting</p>
                                </div>
                            </div>
                        )}
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
