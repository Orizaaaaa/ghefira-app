'use client'
import { getAllTransaction } from '@/api/method'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useDisclosure } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts'

type Props = {}

const page = (props: Props) => {
    const [id, setId] = useState('');
    const [transaction, setTransaction] = useState([]);
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

    const categoryData = [
        { name: 'Makanan & Minuman', value: 45 },
        { name: 'Transportasi', value: 20 },
        { name: 'Belanja', value: 15 },
        { name: 'Hiburan', value: 10 },
        { name: 'Tagihan', value: 8 },
        { name: 'Lainnya', value: 2 }
    ];

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
            const result = await getAllTransaction();
            setTransaction(result);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);
    const total = 2000;
    const spent = 1000;
    const left = total - spent;

    return (
        <DefaultLayout>
            <div className=" flex justify-end mb-4 gap-3">
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={handleOpenCreate}> + Tambah Transaksi </ButtonSecondary>
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={handleOpenUpdate}> + Edit </ButtonSecondary>
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={handleOpenDelete}> delete </ButtonSecondary>
            </div>


            <div className="mx-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-black">My Budget</h2>
                    <button className="text-sm text-gray-500 hover:underline">View all →</button>
                </div>

                {/* Chart area */}
                <div className="relative bg-slate-200 rounded-xl flex flex-col items-center pt-6 pb-8">
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
                    <div className="mt-4 w-full flex justify-around text-sm">
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

                <div className="flex gap-4">
                    <InputForm
                        htmlFor="saldo"
                        title="Saldo"
                        type="text"
                        className="bg-slate-300 rounded-md"
                        onChange={handleChange}
                        value={form.saldo}
                    />

                    {/* Amount */}
                    <InputForm
                        htmlFor="amount"
                        title="Amount"
                        type="number"
                        className="bg-slate-300 rounded-md"
                        onChange={handleChange}
                        value={form.amount}
                    />
                </div>


                {/* Description */}
                <InputForm
                    htmlFor="description"
                    title="Description"
                    type="text"
                    className="bg-slate-300 rounded-md"
                    onChange={handleChange}
                    value={form.description}
                />

                {/* Type */}
                <div className="mt-3">
                    <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                    <select
                        id="type"
                        name="type"
                        className="w-full bg-slate-300 rounded-md p-2 mt-1"
                        value={form.type}
                    >
                        <option value="">Pilih Tipe</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

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
                {/* User */}
                <InputForm
                    htmlFor="user"
                    title="User ID"
                    type="text"
                    className="bg-slate-300 rounded-md mt-3"
                    onChange={handleChangeUpdate}
                    value={formUpdate.user}
                />

                {/* Saldo */}
                <InputForm
                    htmlFor="saldo"
                    title="Saldo ID"
                    type="text"

                    className="bg-slate-300 rounded-md"
                    onChange={handleChangeUpdate}
                    value={formUpdate.saldo}
                />

                {/* Amount */}
                <InputForm
                    htmlFor="amount"
                    title="Amount"
                    type="number"
                    className="bg-slate-300 rounded-md"
                    onChange={handleChangeUpdate}
                    value={formUpdate.amount}
                />

                {/* Description */}
                <InputForm
                    htmlFor="description"
                    title="Description"
                    type="text"
                    className="bg-slate-300 rounded-md"
                    onChange={handleChangeUpdate}
                    value={formUpdate.description}
                />

                {/* Type */}
                <div className="mt-3">
                    <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                    <select
                        id="type"
                        name="type"
                        className="w-full bg-slate-300 rounded-md p-2 mt-1"
                        value={formUpdate.type}
                    >
                        <option value="">Pilih Tipe</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

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