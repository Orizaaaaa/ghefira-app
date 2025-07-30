'use client'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useDisclosure } from '@heroui/react'
import { on } from 'events'
import React, { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Props = {}

const page = (props: Props) => {
    const [id, setId] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure();
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();
    const total = 16234;
    const current = 8445.98;
    const percentage = Math.round((current / total) * 100);
    const [form, setForm] = React.useState({
        name: '',
        amount: '',
        description: ''
    });

    const [formUpdate, setFormUpdate] = React.useState({
        name: '',
        amount: '',
        description: ''
    });

    const dataSideChart = Array.from({ length: 30 }, () => ({
        value: Math.floor(Math.random() * 1000),
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleChangeUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormUpdate({ ...formUpdate, [e.target.name]: e.target.value });
    };

    const openModalUpdate = () => {
        onOpenUpdate();
    }
    const openModalCreate = () => {
        onOpen();
    }

    const openModalDelete = () => {
        onOpenDelete();
    }
    return (
        <DefaultLayout>
            <div className=" flex justify-end mb-4 gap-3">
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={openModalCreate}> + Tambah Saldo </ButtonSecondary>
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={openModalUpdate}> + Edit </ButtonSecondary>
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={openModalDelete}> delete </ButtonSecondary>
            </div>
            <div className="bg-primaryGreen rounded-xl p-4 text-white shadow-md w-full ">
                <p className="text-sm text-gray-200">Saldo Masuk</p>
                <h2 className="text-3xl font-bold">${current.toLocaleString()}</h2>
                <p className="text-sm text-gray-300">/ {total.toLocaleString()}</p>
                <p className="mt-2 text-sm text-gray-200">{percentage}% </p>
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
                    <p className="text-sm text-gray-400">Saldo Keluar</p>
                    <div className="text-xs text-red-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        -9%
                    </div>
                </div>
                <h2 className="text-3xl font-bold mb-2">$11,239.00</h2>
                <ResponsiveContainer width="100%" height={60}>
                    <BarChart data={dataSideChart}>
                        <Bar dataKey="value" fill="#ff5c5c" radius={[4, 4, 0, 0]} barSize={25} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <ModalDefault isOpen={isOpen} onClose={onClose} >
                <InputForm htmlFor="name" title="Name" type="text"
                    className='bg-slate-300 rounded-md mt-3 '
                    onChange={handleChange}
                    value={form.name} />

                <InputForm htmlFor="amount" title="Amount" type="number"
                    className='bg-slate-300 rounded-md '
                    onChange={handleChange}
                    value={form.amount} />

                <InputForm htmlFor="description" title="Amount" type="text"
                    className='bg-slate-300 rounded-md '
                    onChange={handleChange}
                    value={form.description} />

                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={onClose}>Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-2 rounded-xl'>Simpan</ButtonPrimary>
                </div>
            </ModalDefault>

            <ModalDefault isOpen={isOpenUpdate} onClose={onCloseUpdate} >
                <InputForm htmlFor="name" title="Name" type="text"
                    className='bg-slate-300 rounded-md mt-3 '
                    onChange={handleChangeUpdate}
                    value={formUpdate.name} />

                <InputForm htmlFor="amount" title="Amount" type="number"
                    className='bg-slate-300 rounded-md '
                    onChange={handleChangeUpdate}
                    value={form.amount} />

                <InputForm htmlFor="description" title="Amount" type="text"
                    className='bg-slate-300 rounded-md '
                    onChange={handleChangeUpdate}
                    value={formUpdate.description} />

                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={onClose}>Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-2 rounded-xl'>Simpan</ButtonPrimary>
                </div>
            </ModalDefault>

            <ModalAlert isOpen={isOpenDelete} onClose={onCloseDelete}>
                <h1>Apakah anda yakin ingin menghapus saldo ini?</h1>
                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={onCloseDelete}>Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-2 rounded-xl'>Hapus</ButtonPrimary>
                </div>
            </ModalAlert>

        </DefaultLayout>
    )
}

export default page