'use client'
import { createTransactionTrainModel, getAllCategory, getAllSaldo, getStatusModel, resetModels, trainDataset } from '@/api/method'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { formatRupiah } from '@/utils/helper'
import { Autocomplete, AutocompleteItem, useDisclosure } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaInfoCircle } from 'react-icons/fa'
import { FaBrain } from 'react-icons/fa6'
import { LuDatabase } from 'react-icons/lu'
import { MdRestartAlt } from 'react-icons/md'
type ModelStatus = {
    isModelReady: boolean;
    lastTrainingDate: string;
    modelPath: string;
    modelExists: boolean;
    backupExists: boolean;
    classifierInfo: any; // Atau lebih detail kalau kamu tahu strukturnya
};
type Props = {}

const page = (props: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [responseModel, setResponseModel] = useState<ModelStatus | null>(null);
    const [saldo, setSaldo] = useState([]);
    const [category, setCategory] = useState([]);
    const [form, setForm] = useState({
        user: '',
        category: '',
        saldo: '',
        amount: '',
        description: '',
        type: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const fetchData = async () => {

        try {
            const resultSaldo = await getAllSaldo();
            const result = await getAllCategory();
            setSaldo(resultSaldo.data);
            setCategory(result.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        const id = localStorage.getItem('id');
        if (id) {
            setForm(prev => ({
                ...prev,
                user: id
            }));
        }
        fetchData();
    }, []);

    const type = [
        { label: "Pendapatan", key: "income" },
        { label: "Pengeluaran", key: "expense" },
    ];

    const handleSelectionChange = (key: string | null, field: 'saldo' | 'type' | 'category') => {
        if (!key) return;
        setForm((prev) => ({
            ...prev,
            [field]: key
        }));
    };

    const handleSubmitModel = async () => {
        // Validasi: semua field wajib diisi
        const { user, category, saldo, amount, description, type } = form;

        if (!user || !category || !saldo || !amount || !description || !type) {
            toast.error('Semua data harus diisi!');
            return;
        }

        const loadingToast = toast.loading('Sedang menyimpan data...');
        try {
            await createTransactionTrainModel(form, (result: any) => {
                console.log(result);
                setForm({
                    user: '',
                    category: '',
                    saldo: '',
                    amount: '',
                    description: '',
                    type: ''
                });

                const id = localStorage.getItem('id');
                if (id) {
                    setForm(prev => ({
                        ...prev,
                        user: id
                    }));
                }

                toast.success('Data berhasil disimpan!', { id: loadingToast });
                onClose();
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal menyimpan data!', { id: loadingToast });
        }
    };


    const handleResetModel = async () => {
        const loadingToast = toast.loading('Sedang mereset model...');
        try {
            await resetModels((res: any) => {
                toast.success('Model berhasil direset!', { id: loadingToast });
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal mereset model!', { id: loadingToast });
        }
    };


    const handleStatusModel = async () => {
        const loadingToast = toast.loading('Sedang mengambil status model...');
        try {
            await getStatusModel((res: any) => {
                toast.success('status model berhasil diambil!', { id: loadingToast });
                console.log(res);
                setResponseModel(res.data);
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal status model!', { id: loadingToast });
        }
    }

    const handleTrainDataset = async () => {
        const loadingToast = toast.loading('Sedang melatih dataset...');
        try {
            await trainDataset((res: any) => {
                toast.success('Dataset berhasil dilatih!', { id: loadingToast });
                console.log(res);
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal melatih dataset!', { id: loadingToast });
        }
    };

    console.log(category);
    console.log(form);


    return (
        <DefaultLayout>



            <div className="flex justify-end mb-4 gap-5">
                <div onClick={handleTrainDataset} className="cursor-pointer h-16 w-16 rounded-full border-2 border-primaryGreen flex justify-center items-center">
                    <FaBrain color='#5E936C' size={24} />
                </div>
                <div onClick={onOpen} className="cursor-pointer h-16 w-16 rounded-full border-2 border-primaryGreen flex justify-center items-center">
                    <LuDatabase color='#5E936C' size={24} />
                </div>
                <div onClick={handleStatusModel} className="cursor-pointer h-16 w-16 rounded-full border-2 border-primaryGreen flex justify-center items-center">
                    <FaInfoCircle color='#5E936C' size={24} />
                </div>
                <div onClick={handleResetModel} className="cursor-pointer h-16 w-16 rounded-full border-2 border-primaryGreen flex justify-center items-center">
                    <MdRestartAlt color='#5E936C' size={24} />
                </div>
            </div>

            <div className="min-h-[400px]  p-4 border-2 border-gray-300 rounded-xl" >
                {responseModel && (
                    <div className="space-y-2">
                        <h1>desain nya belum kepikiran hhehhee 🐷</h1>
                        <p>Status: {responseModel.isModelReady ? 'Siap' : 'Belum siap'}</p>
                        <p>Terakhir Training: {responseModel.lastTrainingDate}</p>
                        <p>Path Model: {responseModel.modelPath}</p>
                        <p>Model Ada: {responseModel.modelExists ? 'Ya' : 'Tidak'}</p>
                        <p>Backup Ada: {responseModel.backupExists ? 'Ya' : 'Tidak'}</p>
                        <p>Classifier Info: {JSON.stringify(responseModel.classifierInfo)}</p>
                    </div>
                )}
            </div>

            <ModalDefault isOpen={isOpen} onClose={onClose}>
                <h1 className="text-2xl font-bold mb-4" >Latih Model</h1>
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
                                <AutocompleteItem textValue={item.name} key={item._id}>
                                    {item.name} <span className='text-sm text-green-700'>{formatRupiah(item.amount)}</span>
                                </AutocompleteItem>
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
                            {type.map((item) => (
                                <AutocompleteItem textValue={item.label} key={item.key}>{item.label}</AutocompleteItem>
                            ))}
                        </Autocomplete>
                    </div>
                </div>
                <InputForm htmlFor="amount" type="text" title='Jumlah'
                    className='bg-slate-100 rounded-md mt-3 ' onChange={handleChange}
                    value={form.amount}
                />

                <InputForm htmlFor="description" type="text" title='Deskripsi'
                    className='bg-slate-100 rounded-md mt-3 ' onChange={handleChange}
                    value={form.description}
                />

                <div className="">
                    <h1>Pilih Tipe</h1>
                    <Autocomplete
                        className="w-full"
                        variant='bordered'
                        onSelectionChange={(e: any) => handleSelectionChange(e, 'category')}
                        value={form.category}
                    >
                        {category.map((item: any) => (
                            <AutocompleteItem textValue={item.name} key={item._id}>{item.name}
                                <span className={
                                    `inline-block px-2 py-1 rounded-full text-xs  ml-2 ${item.type === 'income'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {item.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
                                </span> </AutocompleteItem>
                        ))}
                    </Autocomplete>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <ButtonSecondary className="py-1 px-4 rounded-xl" onClick={onClose}>
                        Batal
                    </ButtonSecondary>
                    <ButtonPrimary className="py-1 px-4 rounded-xl" onClick={handleSubmitModel} >
                        Simpan
                    </ButtonPrimary>
                </div>

            </ModalDefault>
        </DefaultLayout>

    )
}

export default page