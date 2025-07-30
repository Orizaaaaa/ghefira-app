'use client'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import React from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Props = {}

const page = (props: Props) => {
    const total = 16234;
    const current = 8445.98;
    const percentage = Math.round((current / total) * 100);


    const dataSideChart = Array.from({ length: 30 }, () => ({
        value: Math.floor(Math.random() * 1000),
    }));
    const data = [
        { date: 'May 15', value: 100 },
        { date: 'May 20', value: 80 },
        { date: 'May 25', value: 130 },
        { date: 'May 30', value: 90 },
        { date: 'Jun 05', value: 120 },
        { date: 'Jun 10', value: 110 },
        { date: 'Jun 15', value: 160 },
    ];
    return (
        <DefaultLayout>
            <div className=" flex justify-end mb-4">
                <ButtonSecondary className='py-1 px-2 rounded-xl'> + Tambah Transaksi </ButtonSecondary>
            </div>
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


        </DefaultLayout>
    )
}

export default page