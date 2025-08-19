'use client'
import { createTransactionTrainModel, deleteTransaction, getAllCategory, getAllSaldo, getAllTransaction, getStatusModel, resetModels, trainDataset, updateTransaction } from '@/api/method'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useAuth } from '@/hook/AuthContext'
import { formatDateWithDays, formatRupiah } from '@/utils/helper'
import { Autocomplete, AutocompleteItem, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react'
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FaInfoCircle } from 'react-icons/fa'
import { FaArrowDown, FaArrowUp, FaBrain } from 'react-icons/fa6'
import { IoMdTrash } from 'react-icons/io'
import { LuDatabase } from 'react-icons/lu'
import { MdRestartAlt } from 'react-icons/md'
import { RiEdit2Fill } from 'react-icons/ri'
type ModelStatus = {
    isModelReady: boolean;
    lastTrainingDate: string;
    modelPath: string;
    modelExists: boolean;
    backupExists: boolean;
    classifierInfo: any; // Atau lebih detail kalau kamu tahu strukturnya
};
interface User {
    _id: string;
    name: string;
    email: string;
}

interface Category {
    _id: string;
    name: string;
}
interface PaginationData {
    total: number;
    page: number;
    limit: number;
    pages: number;
}
interface Meta {
    message: string;
    code: number;
    status: string;
    pagination: PaginationData;
}
interface Saldo {
    _id: string;
    name: string;
    amount: number;
}

interface Transaction {
    _id: string;
    user: User;
    category: Category;
    saldo: Saldo;
    amount: number;
    description: string;
    type: 'income' | 'expense';
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface ApiResponse {
    meta: Meta;
    data: Transaction[];
}
type Props = {}

const page = (props: Props) => {
    const { role } = useAuth();
    // ===========================
    // Disclosure (modal handlers)
    // ===========================
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure();
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

    // ===========================
    // State
    // ===========================
    const [responseModel, setResponseModel] = useState<ModelStatus | null>(null);
    const [saldo, setSaldo] = useState([]);
    const [category, setCategory] = useState([]);
    const [transaction, setTransaction] = useState<ApiResponse | null>(null);
    const [id, setId] = useState('');
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        user: '',
        category: '',
        saldo: '',
        amount: '',
        description: '',
        type: ''
    });

    const [formUpdate, setFormUpdate] = useState({
        user: '',
        saldo: '',
        amount: '',
        description: '',
        category: '',
        type: ''
    });

    // ===========================
    // Pagination
    // ===========================
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const totalItems = transaction?.meta?.pagination?.total || 0;
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    const currentItems = useMemo(() => {
        if (!transaction?.data) return [];
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return transaction.data.slice(start, end);
    }, [currentPage, transaction?.data, rowsPerPage]);

    // ===========================
    // Data Fetching
    // ===========================
    const fetchData = async () => {
        try {
            const resultSaldo = await getAllSaldo();
            const result = await getAllCategory();
            const resultTransaction = await getAllTransaction();
            const dataStatusModel = await getStatusModel((res: any) => {
                console.log(res);
                setResponseModel(res.data);
            });

            console.log(dataStatusModel);
            setTransaction(resultTransaction);
            setSaldo(resultSaldo.data);
            setCategory(result.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        const id = localStorage.getItem('id');
        if (id) {
            setForm(prev => ({ ...prev, user: id }));
        }
        fetchData();
    }, []);


    // ===========================
    // Selection Options
    // ===========================
    const type = [
        { label: "Pendapatan", key: "income" },
        { label: "Pengeluaran", key: "expense" },
    ];

    // ===========================
    // Form Handlers
    // ===========================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleChangeUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormUpdate({ ...formUpdate, [e.target.name]: e.target.value });
    };

    const handleSelectionChange = (key: string | null, field: 'saldo' | 'type' | 'category') => {
        if (!key) return;
        setForm(prev => ({ ...prev, [field]: key }));
    };

    const handleSelectionChangeUpdate = (key: string | null, field: 'saldo' | 'type' | 'category') => {
        if (!key) return;
        setFormUpdate(prev => ({ ...prev, [field]: key }));
    };

    const handleOpenUpdate = () => onOpenUpdate();
    const handleOpenDelete = () => onOpenDelete();

    // ===========================
    // CRUD + Model Handlers
    // ===========================
    const handleSubmitModel = async () => {
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
                fetchData();
                const id = localStorage.getItem('id');
                if (id) {
                    setForm(prev => ({ ...prev, user: id }));
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
    };

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

    const handleDelete = async () => {
        const toastId = toast.loading('Menghapus transaksi...');
        try {
            await deleteTransaction(id);
            fetchData();
            onCloseDelete();
            toast.success('Transaksi berhasil dihapus!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Gagal menghapus transaksi.', { id: toastId });
        }
    };

    const handleEditTransaction = async () => {
        const { user, saldo, amount, description, type, category } = formUpdate;

        if (!user || !saldo || !amount || !description || !type || !category) {
            toast.error('Semua data harus diisi!');
            return;
        }

        const toastId = toast.loading('Mengubah transaksi...');
        try {
            await updateTransaction(id, formUpdate, (res: any) => {
                console.log(res);
                fetchData();
                toast.success('Transaksi berhasil diubah!', { id: toastId });
                onCloseUpdate();
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengubah transaksi.', { id: toastId });
        }
    };


    // ===========================
    // Debugging Logs
    // ===========================
    console.log(category);
    console.log(form);
    console.log(responseModel);
    console.log('anjayyy', role);


    return (
        <DefaultLayout>
            <div className={`${role !== 'user' ? 'hidden' : ''}`}>
                <div className={`block md:flex justify-between items-center mb-5 `}>
                    <ButtonSecondary className='w-full md:w-auto p-3 rounded-xl flex justify-center items-center gap-2 text-primaryGreen' onClick={onOpen} >
                        <LuDatabase color='#5E936C' size={24} />
                        Tambah Dataset
                    </ButtonSecondary>

                    <div className="flex justify-center items-center  md:justify-center gap-5 mt-5 md:mt-0">
                        <div onClick={handleTrainDataset} className="cursor-pointer h-16 w-16 rounded-full border-2 border-primaryGreen flex justify-center items-center">
                            <FaBrain color='#5E936C' size={24} />
                        </div>
                        <div onClick={handleStatusModel} className="cursor-pointer h-16 w-16 rounded-full border-2 border-primaryGreen flex justify-center items-center">
                            <FaInfoCircle color='#FEA405' size={24} />
                        </div>
                        <div onClick={handleResetModel} className="cursor-pointer h-16 w-16 rounded-full border-2 border-primaryGreen flex justify-center items-center">
                            <MdRestartAlt color='red' size={26} />
                        </div>
                    </div>
                </div>
            </div>




            <div className="min-h-[400px] p-6 bg-white border-2 border-gray-200 rounded-xl shadow-md">
                {responseModel ? (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                            🧠 Status Model Machine Learning
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-500">Status Model</p>
                                <p className={`text-lg font-semibold ${responseModel.isModelReady ? 'text-green-600' : 'text-red-600'}`}>
                                    {responseModel.isModelReady ? '✅ Siap digunakan' : '❌ Belum siap'}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-500 mb-2">Terakhir Training</p>
                                <p className="text-lg font-medium text-gray-700">{responseModel.lastTrainingDate}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm col-span-1 md:col-span-2">
                                <p className="text-sm text-gray-500 mb-2">Path Model</p>
                                <p className="text-sm font-mono break-all text-blue-700">{responseModel.modelPath}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-500 mb-2">Model Tersedia</p>
                                <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${responseModel.modelExists ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {responseModel.modelExists ? 'Ya' : 'Tidak'}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-500 mb-2">Backup Tersedia</p>
                                <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${responseModel.backupExists ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {responseModel.backupExists ? 'Ya' : 'Tidak'}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm col-span-1 md:col-span-2">
                                <p className="text-sm text-gray-500 mb-1">Classifier Info</p>
                                <pre className="bg-gray-100 text-sm p-3 rounded-lg overflow-x-auto text-gray-800">
                                    {JSON.stringify(responseModel.classifierInfo, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-400 italic">
                        Data model belum tersedia 💤
                    </div>
                )}
            </div>

            <h1 className="text-2xl font-bold  mt-11 mb-3 inline-block italic text-primaryGreen">
                📂 List Dataset
            </h1>

            {role !== 'user' ? (<Table
                isCompact
                className=''
                aria-label="Tabel Transaksi"
                bottomContent={
                    <div className="flex w-full justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Menampilkan {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)}-
                            {Math.min(currentPage * rowsPerPage, totalItems)} dari {totalItems} transaksi
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="primary"
                                classNames={{
                                    cursor: "bg-primaryGreen text-white cursor-pointer"
                                }}
                                page={currentPage}
                                total={totalPages}
                                onChange={setCurrentPage}
                                className="ml-auto"
                            />
                        )}
                    </div>
                }
                classNames={{
                    wrapper: "min-h-[250px]",
                    th: 'bg-secondaryGreen text-white font-semibold',
                    td: 'text-black',
                }}
            >
                <TableHeader>
                    <TableColumn key="description">DESKRIPSI</TableColumn>
                    <TableColumn key="category">KATEGORI</TableColumn>
                    <TableColumn key="saldo">SALDO</TableColumn>
                    <TableColumn key="amount">JUMLAH</TableColumn>
                    <TableColumn key="type">JENIS</TableColumn>
                    <TableColumn key="createdAt">TANGGAL</TableColumn>

                </TableHeader>
                <TableBody
                    items={currentItems}
                    isLoading={loading}
                    loadingContent={<span>Memuat data...</span>}
                >
                    {(item: Transaction) => (
                        <TableRow key={item._id}>
                            <TableCell className='text-sm' >{item.description}</TableCell>
                            <TableCell className='text-sm'>{item.category.name}</TableCell>
                            <TableCell className='text-sm'>{item.saldo.name}</TableCell>
                            <TableCell className={item.type === 'income' ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                                {formatRupiah(item.amount)}
                            </TableCell>
                            <TableCell className='text-sm'>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                                    ${item.type === 'income'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'}`}>
                                    {item.type === 'income' ? <FaArrowDown className="text-green-500" /> : <FaArrowUp className="text-red-500" />}
                                    {item.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
                                </span>
                            </TableCell>
                            <TableCell className='text-sm'>{formatDateWithDays(item.createdAt)}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            ) : (
                <Table
                    isCompact
                    className=''
                    aria-label="Tabel Transaksi"
                    bottomContent={
                        <div className="flex w-full justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Menampilkan {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)}-
                                {Math.min(currentPage * rowsPerPage, totalItems)} dari {totalItems} transaksi
                            </div>

                            {totalPages > 1 && (
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="primary"
                                    classNames={{
                                        cursor: "bg-primaryGreen text-white cursor-pointer"
                                    }}
                                    page={currentPage}
                                    total={totalPages}
                                    onChange={setCurrentPage}
                                    className="ml-auto"
                                />
                            )}
                        </div>
                    }
                    classNames={{
                        wrapper: "min-h-[250px]",
                        th: 'bg-secondaryGreen text-white font-semibold',
                        td: 'text-black',
                    }}
                >
                    <TableHeader>
                        <TableColumn key="description">DESKRIPSI</TableColumn>
                        <TableColumn key="category">KATEGORI</TableColumn>
                        <TableColumn key="saldo">SALDO</TableColumn>
                        <TableColumn key="amount">JUMLAH</TableColumn>
                        <TableColumn key="type">JENIS</TableColumn>
                        <TableColumn key="createdAt">TANGGAL</TableColumn>
                        <TableColumn key="actions">AKSI</TableColumn>
                    </TableHeader>
                    <TableBody
                        items={currentItems}
                        isLoading={loading}
                        loadingContent={<span>Memuat data...</span>}
                    >
                        {(item: Transaction) => (
                            <TableRow key={item._id}>
                                <TableCell className='text-sm' >{item.description}</TableCell>
                                <TableCell className='text-sm'>{item.category.name}</TableCell>
                                <TableCell className='text-sm'>{item.saldo.name}</TableCell>
                                <TableCell className={item.type === 'income' ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                                    {formatRupiah(item.amount)}
                                </TableCell>
                                <TableCell className='text-sm'>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                                    ${item.type === 'income'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'}`}>
                                        {item.type === 'income' ? <FaArrowDown className="text-green-500" /> : <FaArrowUp className="text-red-500" />}
                                        {item.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
                                    </span>
                                </TableCell>


                                <TableCell className='text-sm'>{formatDateWithDays(item.createdAt)}</TableCell>
                                <TableCell className='text-sm'>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setId(item._id);
                                                setFormUpdate({
                                                    user: item.user._id,
                                                    saldo: item.saldo._id,
                                                    amount: item.amount.toString(),
                                                    description: item.description,
                                                    type: item.type,
                                                    category: item.category._id
                                                });
                                                handleOpenUpdate();
                                            }}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <RiEdit2Fill size={20} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setId(item._id);
                                                handleOpenDelete();
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <IoMdTrash size={20} />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>)}


            <ModalDefault isOpen={isOpen} onClose={onClose}>
                <h1 className="text-2xl font-bold mb-4" >Latih Model</h1>
                <div className="flex gap-4">
                    <div className="">
                        <h1>Pilih Kategori</h1>
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
                    <h1>Pilih Kategori</h1>
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

            <ModalDefault isOpen={isOpenUpdate} onClose={onCloseUpdate}>
                <h1 className='text-xl font-bold my-4'>Edit Transaksi</h1>
                <div className="flex gap-4">
                    <div className="">
                        <h1>Pilih Saldo</h1>
                        <Autocomplete
                            className="w-full"
                            variant='bordered'
                            onSelectionChange={(e: any) => handleSelectionChangeUpdate(e, 'saldo')}
                            value={formUpdate.saldo}
                            selectedKey={formUpdate.saldo}
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
                            onSelectionChange={(e: any) => handleSelectionChangeUpdate(e, 'type')}
                            value={formUpdate.type}
                            selectedKey={formUpdate.type}
                        >
                            {type.map((item) => (
                                <AutocompleteItem textValue={item.label} key={item.key}>{item.label}</AutocompleteItem>
                            ))}
                        </Autocomplete>
                    </div>

                </div>

                <InputForm
                    htmlFor="description"
                    title="Description"
                    type="text"
                    className="bg-slate-100 rounded-md py-5"
                    onChange={handleChangeUpdate}
                    value={formUpdate.description}
                />

                <InputForm
                    htmlFor="amount"
                    title="Amount"
                    type="number"
                    className="bg-slate-100 rounded-md py-5"
                    onChange={handleChangeUpdate}
                    value={formUpdate.amount}
                />
                <div className="">
                    <h1>Pilih Kategori</h1>
                    <Autocomplete
                        className="w-full"
                        variant='bordered'
                        onSelectionChange={(e: any) => handleSelectionChangeUpdate(e, 'category')}
                        value={form.category}
                        selectedKey={formUpdate.category}
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
                    <ButtonSecondary className="py-1 px-2 rounded-xl" onClick={onCloseUpdate}>
                        Batal
                    </ButtonSecondary>
                    <ButtonPrimary className="py-1 px-2 rounded-xl" onClick={handleEditTransaction}>
                        Simpan
                    </ButtonPrimary>
                </div>
            </ModalDefault>

            <ModalAlert isOpen={isOpenDelete} onClose={onCloseDelete}>
                <h1>Apakah anda yakin ingin menghapus transaksi ini?</h1>
                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={onCloseDelete}>Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-2 rounded-xl' onClick={handleDelete}>Hapus</ButtonPrimary>
                </div>
            </ModalAlert>
        </DefaultLayout>

    )
}

export default page