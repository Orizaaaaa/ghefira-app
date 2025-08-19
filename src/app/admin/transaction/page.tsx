'use client'
import { createTransactionModel, deleteTransaction, getAllCategory, getAllSaldo, getAllTransaction, updateTransaction } from '@/api/method'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useAuth } from '@/hook/AuthContext'
import { formatDate, formatDateWithDays, formatRupiah } from '@/utils/helper'
import { Autocomplete, AutocompleteItem, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react'
import React, { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { BiTrendingDown, BiTrendingUp } from 'react-icons/bi'
import { BsBox, BsLayers } from 'react-icons/bs'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa6'
import { IoMdTrash } from 'react-icons/io'
import { RiEdit2Fill } from 'react-icons/ri'
import { Cell, Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts'

interface User {
    _id: string;
    name: string;
    email: string;
}

interface Category {
    _id: string;
    name: string;
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

interface ApiResponse {
    meta: Meta;
    data: Transaction[];
}

type Props = {}

const Page = (props: Props) => {
    const { role } = useAuth();
    const [id, setId] = useState('');
    const [transaction, setTransaction] = useState<ApiResponse | null>(null);
    const [category, setCategory] = useState([]);
    const [saldo, setSaldo] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure();
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [form, setForm] = useState({
        user: '',
        saldo: '',
        amount: '',
        description: '',
        type: '',
    });

    const [formUpdate, setFormUpdate] = useState({
        user: '',
        saldo: '',
        amount: '',
        description: '',
        type: '',
    })

    // Calculate pagination values
    const totalItems = transaction?.meta?.pagination?.total || 0;
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    // Get current page items
    const currentItems = useMemo(() => {
        if (!transaction?.data) return [];
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return transaction.data.slice(start, end);
    }, [currentPage, transaction?.data, rowsPerPage]);

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


    const fetchData = async () => {
        setLoading(true);
        try {
            const resultCategory = await getAllCategory();
            const resultSaldo = await getAllSaldo();
            const result = await getAllTransaction();
            setCategory(resultCategory.data);
            setSaldo(resultSaldo.data);
            setTransaction(result);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
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

    const type = [
        { label: "Pendapatan", key: "income" },
        { label: "Pengeluaran", key: "expense" },
    ];
    const handleCreateTransaction = async () => {
        const { user, saldo, amount, description, type } = form;

        if (!user || !saldo || !amount || !description || !type) {
            toast.error('Semua data harus diisi!');
            return;
        }

        const toastId = toast.loading('Menyimpan transaksi...');
        try {
            await createTransactionModel(form, (res: any) => {
                console.log(res);
                fetchData();
                onClose();
                toast.success('Transaksi berhasil dibuat!', { id: toastId });
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal membuat transaksi.', { id: toastId });
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
    }


    const handleEditTransaction = async () => {
        const { user, saldo, amount, description, type } = formUpdate;

        if (!user || !saldo || !amount || !description || !type) {
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
    let totalExpense = 0;
    let totalIncome = 0;

    transaction?.data.forEach(transaction => {
        if (transaction.type === "expense") { // Typo: seharusnya "expense"
            totalExpense += transaction.amount;
        } else if (transaction.type === "income") {
            totalIncome += transaction.amount;
        }
    });

    console.log('transaksi', transaction?.data);
    console.log('saldo', saldo);
    console.log('category', category.length);
    console.log('id', id);



    return (
        <DefaultLayout>
            <div className={`flex justify-end mb-4 gap-3  ${role !== 'user' && 'hidden'}`}>
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={handleOpenCreate}> + Tambah Transaksi </ButtonSecondary>
            </div>

            <div className="flex flex-col gap-6">

                {/* Statistik Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <BsBox className="text-blue-500 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Kategori</p>
                            <h2 className="text-xl font-bold">{category.length}</h2>
                        </div>
                    </div>
                    <div className="bg-green-100 p-4 rounded-xl shadow flex items-center gap-4">
                        <div className="bg-green-200 p-2 rounded-full">
                            <BiTrendingUp className="text-green-800 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-green-800 text-sm">Pendapatan</p>
                            <h2 className="text-lg font-semibold text-green-900">{formatRupiah(totalIncome)}</h2>
                        </div>
                    </div>
                    <div className="bg-red-100 p-4 rounded-xl shadow flex items-center gap-4">
                        <div className="bg-red-200 p-2 rounded-full">
                            <BiTrendingDown className="text-red-800 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-red-800 text-sm">Pengeluaran</p>
                            <h2 className="text-lg font-semibold text-red-900">{formatRupiah(totalExpense)}</h2>
                        </div>
                    </div>
                </div>
            </div>
            {role !== 'user' ? (<Table
                isCompact
                className='mt-5'
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
                    className='mt-5'
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
                </Table>
            )}


            <ModalDefault isOpen={isOpen} onClose={onClose}>
                <h1 className='text-xl font-bold my-4'>Tambah Transaksi</h1>
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

                <div className="flex justify-end gap-2 mt-4">
                    <ButtonSecondary className="py-1 px-2 rounded-xl" onClick={onClose}>
                        Batal
                    </ButtonSecondary>
                    <ButtonPrimary className="py-1 px-2 rounded-xl" onClick={handleCreateTransaction}>
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

export default Page