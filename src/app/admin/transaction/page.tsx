'use client'
import { getAllCategory, getAllSaldo, getAllTransaction } from '@/api/method'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { formatRupiah } from '@/utils/helper'
import { Autocomplete, AutocompleteItem, useDisclosure } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts'


type Props = {}

const page = (props: Props) => {
    const [id, setId] = useState('');
    const [transaction, setTransaction] = useState([]);
    const [category, setCategory] = useState([]);
    const [saldo, setSaldo] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure();
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();
    const [form, setForm] = useState({
        user: '',
        saldo: '',
        amount: '',
        description: '',
        type: '', // atau bisa default ke 'income' kalau dibutuhkan
    });

    const [formUpdate, setFormUpdate] = useState({
        user: '',
        saldo: '',
        amount: '',
        description: '',
        type: '', // atau bisa default ke 'income' kalau dibutuhkan
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleChangeUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormUpdate({ ...formUpdate, [e.target.name]: e.target.value });
    };

    const handleOpenCreate = () => {
        onOpen();
    };

    const handleOpenUpdate = () => {
        onOpenUpdate();
    }

    const handleOpenDelete = () => {
        onOpenDelete();
    }

    const data = [
        {
            name: 'Spent',
            value: 50, // persen dari 2000
            fill: '#3B82F6', // warna biru
        },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const resultCategory = await getAllCategory();
            const resultSaldo = await getAllSaldo();
            const result = await getAllTransaction();
            setSaldo(resultSaldo.data);
            setTransaction(result);
            setCategory(resultCategory.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelectionChange = (key: string | null, field: 'saldo' | 'type') => {
        if (!key) return;
        setForm((prev) => ({
            ...prev,
            [field]: key
        }));
    };
    const handleSelectionChangeUpdate = (key: string | null, field: 'saldo' | 'type') => {
        if (!key) return;
        setFormUpdate((prev) => ({
            ...prev,
            [field]: key
        }));
    };

    const total = 2000;
    const spent = 1000;
    const left = total - spent;

    console.log(saldo);
    console.log(form);
    const type = [
        { label: "Pendapatan", key: "income" },
        { label: "Pengeluaran", key: "expense" },];

    console.log('transaction', transaction);


    return (
        <DefaultLayout>
            <div className=" flex justify-end mb-4 gap-3">
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={handleOpenCreate}> + Tambah Transaksi </ButtonSecondary>
            </div>


            <div className="mx-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-black">My Budget</h2>
                    <button className="text-sm text-gray-500 hover:underline">View all →</button>
                </div>

                {/* Chart area */}
                <div className="relative bg-slate-200 rounded-xl flex flex-col items-center py-3">
                    {/* Chart */}
                    <RadialBarChart
                        width={400}
                        height={200}
                        cx="50%"
                        cy="50%"
                        innerRadius="70%"
                        outerRadius="100%"
                        startAngle={180}
                        endAngle={0}
                        data={data}
                    >
                        <PolarAngleAxis
                            type="number"
                            domain={[0, 100]}
                            angleAxisId={0}
                            tick={false}
                        />
                        <RadialBar
                            background
                            dataKey="value"
                            cornerRadius={10}
                        />
                    </RadialBarChart>

                    {/* Center Total */}
                    <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-sm text-gray-500">Total to spend</p>
                        <p className="text-2xl font-bold text-blue-600">${total.toLocaleString()}</p>
                    </div>

                    {/* Spent & Left */}
                    <div className=" w-full flex justify-around text-sm">
                        <div className="text-center">
                            <p className="text-gray-400">Spent</p>
                            <p className="text-red-500 font-semibold">{spent.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400">Left</p>
                            <p className="text-green-500 font-semibold">{left.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>


            <ModalDefault isOpen={isOpen} onClose={onClose}>
                {/* Saldo */}
                <h1 className='text-xl font-bold my-4' >Tambah Transaksi</h1>

                <div className="flex gap-4">
                    <div className="">
                        <h1>Pilih Saldo</h1>
                        <Autocomplete
                            className="w-full"
                            variant='bordered'
                            onSelectionChange={(e: any) => handleSelectionChange(e, 'saldo')}
                            value={form.saldo}
                        >
                            {saldo.map((item: any) => (
                                <AutocompleteItem textValue={item.name} key={item._id}>{item.name} <span className='text-sm text-green-700'>{formatRupiah(item.amount)}</span></AutocompleteItem>
                            ))}
                        </Autocomplete>
                    </div>
                    <div className="">
                        <h1>Pilih Tipe</h1>
                        <Autocomplete
                            className="w-full"
                            variant='bordered'
                            onSelectionChange={(e: any) => handleSelectionChange(e, 'type')}
                            value={form.type}
                        >
                            {type.map((item: any) => (
                                <AutocompleteItem textValue={item.label} key={item.key}>{item.label} </AutocompleteItem>
                            ))}
                        </Autocomplete>
                    </div>
                </div>

                {/* Description */}
                <InputForm
                    htmlFor="description"
                    title="Description"
                    type="text"
                    className="bg-slate-100 rounded-md"
                    onChange={handleChange}
                    value={form.description}
                />

                <InputForm
                    htmlFor="amount"
                    title="Amount"
                    type="number"
                    className="bg-slate-100 rounded-md"
                    onChange={handleChange}
                    value={form.amount}
                />

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                    <ButtonSecondary className="py-1 px-2 rounded-xl" onClick={onClose}>
                        Batal
                    </ButtonSecondary>
                    <ButtonPrimary className="py-1 px-2 rounded-xl">
                        Simpan
                    </ButtonPrimary>
                </div>
            </ModalDefault>


            <ModalDefault isOpen={isOpenUpdate} onClose={onCloseUpdate}>
                <div className="flex gap-4">
                    <div className="">
                        <h1>Pilih Saldo</h1>
                        <Autocomplete
                            className="w-full"
                            variant='bordered'
                            onSelectionChange={(e: any) => handleSelectionChangeUpdate(e, 'saldo')}
                            value={formUpdate.saldo}
                        >
                            {saldo.map((item: any) => (
                                <AutocompleteItem textValue={item.name} key={item._id}>{item.name} <span className='text-sm text-green-700'>{formatRupiah(item.amount)}</span></AutocompleteItem>
                            ))}
                        </Autocomplete>
                    </div>
                    <div className="">
                        <h1>Pilih Tipe</h1>
                        <Autocomplete
                            className="w-full"
                            variant='bordered'
                            onSelectionChange={(e: any) => handleSelectionChangeUpdate(e, 'type')}
                            value={formUpdate.type}
                        >
                            {type.map((item: any) => (
                                <AutocompleteItem textValue={item.label} key={item.key}>{item.label} </AutocompleteItem>
                            ))}
                        </Autocomplete>
                    </div>
                </div>

                {/* Description */}
                <InputForm
                    htmlFor="description"
                    title="Description"
                    type="text"
                    className="bg-slate-100 rounded-md"
                    onChange={handleChangeUpdate}
                    value={formUpdate.description}
                />

                <InputForm
                    htmlFor="amount"
                    title="Amount"
                    type="number"
                    className="bg-slate-100 rounded-md"
                    onChange={handleChangeUpdate}
                    value={formUpdate.amount}
                />

                {/* Tombol Aksi */}
                <div className="flex justify-end gap-2 mt-4">
                    <ButtonSecondary className="py-1 px-2 rounded-xl" onClick={onCloseUpdate}>
                        Batal
                    </ButtonSecondary>
                    <ButtonPrimary className="py-1 px-2 rounded-xl">
                        Simpan
                    </ButtonPrimary>
                </div>
            </ModalDefault>


            <ModalAlert isOpen={isOpenDelete} onClose={onCloseDelete}>
                <h1>Apakah anda yakin ingin menghapus transaksi ini?</h1>
                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={onCloseDelete}>Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-2 rounded-xl'>Hapus</ButtonPrimary>
                </div>
            </ModalAlert>
        </DefaultLayout>
    )
}

export default page