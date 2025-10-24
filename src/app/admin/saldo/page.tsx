'use client'
import { createAccountingAccount, getAllAccountingAccounts, getSumaryMounth, updateAccountingAccount } from '@/api/method'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useAuth } from '@/hook/AuthContext'
import { formatRupiah } from '@/utils/helper'
import { getKeyValue, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react'
import { m } from 'framer-motion'
import { s } from 'framer-motion/client'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaPenSquare } from 'react-icons/fa'
import { MdCheckBoxOutlineBlank } from 'react-icons/md'
import { RiEdit2Fill } from 'react-icons/ri'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Props = {}


interface AccountingAccount {
    _id: string;
    name: string;
    code: string;
    type: string;
    normal_balance: string;
    description?: string;
    balance?: number;
    user: string;
    is_active?: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    display_balance?: number;
    accounting_balance?: number;
}

interface ApiResponse {
    code: number;
    status: string;
    data: {
        accounts: AccountingAccount[];
    };
    meta?: {
        code: number;
        message: string;
        pagination: {
            limit: number;
            page: number;
            pages: number;
            total: number;
        };
        status: string;
    };
}

const page = (props: Props) => {
    const { role } = useAuth();
    const [id, setId] = useState('');
    const [loading, setLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure();
    const [monthlyData, setMonthlyData] = useState({} as any);
    const target = 10_000_000;
    const current = monthlyData?.income ?? 0;
    const percentage = Math.round((current / target) * 100);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
    const [accountingData, setAccountingData] = useState<AccountingAccount[]>([]);

    const [form, setForm] = useState({
        name: '',
        code: '',
        type: '',
        normal_balance: '',
        description: ''
    });

    const [formUpdate, setFormUpdate] = useState({
        name: '',
        code: '',
        type: '',
        normal_balance: '',
        description: ''
    });

    const dataSideChart = Array.from({ length: 30 }, () => ({
        value: Math.floor(Math.random() * 1000),
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleChangeUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormUpdate({ ...formUpdate, [name]: value });
    };


    const fetchData = async () => {
        setLoading(true);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        try {
            const result = await getAllAccountingAccounts();
            const resultDate = await getSumaryMounth(currentMonth, currentYear, (res: any) => {
                setMonthlyData(res); // <-- data bulanan, bisa untuk card ringkasan
            });
            console.log('API Response:', result.data.accounts);
            setApiResponse(result);

            // Handle different response structures
            if (result && result.data && result.data.accounts && Array.isArray(result.data.accounts)) {
                // If result has a data.accounts property that is an array
                setAccountingData(result.data.accounts);
            } else if (result && Array.isArray(result)) {
                // If result is directly an array
                setAccountingData(result);
            } else if (result && result.data && Array.isArray(result.data)) {
                // If result has a data property that is an array
                setAccountingData(result.data);
            } else {
                // Fallback to empty array
                console.warn('Unexpected API response structure:', result);
                setAccountingData([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setAccountingData([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Calculate pagination
    const totalItems = Array.isArray(accountingData) ? accountingData.length : (apiResponse?.meta?.pagination?.total || 0);

    // Hitung total halaman asli
    const calculatedTotalPages = Math.ceil(totalItems / rowsPerPage);
    const totalPages = Math.max(calculatedTotalPages, 20);

    // Get current page items
    const currentItems = React.useMemo(() => {
        if (!Array.isArray(accountingData)) {
            return [];
        }
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return accountingData.slice(start, end);
    }, [currentPage, accountingData, rowsPerPage]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    const openModalCreate = () => {
        onOpen();
    }

    const handleCreateAccount = async () => {
        if (!form.name || !form.code || !form.type || !form.normal_balance) {
            toast.error('Semua field harus diisi!');
            return;
        }

        setCreateLoading(true);
        const loadingToast = toast.loading('Menyimpan data akun...');
        try {
            await createAccountingAccount(form, (res: any) => {
                toast.success('Akun berhasil ditambahkan', { id: loadingToast });

                fetchData();
                onClose();
                setForm({
                    name: '',
                    code: '',
                    type: '',
                    normal_balance: '',
                    description: ''
                });
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal menambahkan akun', { id: loadingToast });
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEditAccount = async () => {
        if (!formUpdate.name || !formUpdate.code || !formUpdate.type || !formUpdate.normal_balance) {
            toast.error('Semua field harus diisi!');
            return;
        }

        setUpdateLoading(true);
        const loadingToast = toast.loading('Mengubah data akun...');
        try {
            await updateAccountingAccount(id, formUpdate, (res: any) => {
                toast.success('Akun berhasil diubah', { id: loadingToast });

                fetchData();
                onCloseUpdate();
                setFormUpdate({
                    name: '',
                    code: '',
                    type: '',
                    normal_balance: '',
                    description: ''
                });
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengubah akun', { id: loadingToast });
        } finally {
            setUpdateLoading(false);
        }
    };



    console.log(monthlyData);

    return (
        <DefaultLayout>
            <div className={` flex justify-end mb-4 gap-3 ${role === 'admin' && 'hidden'}`}>
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={openModalCreate}>
                    {createLoading ? 'Menyimpan...' : '+ Tambah Akun'}
                </ButtonSecondary>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Saldo Masuk Card - Enhanced */}
                <div className="bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-emerald-100">Total Saldo Masuk</p>
                            <div className="flex items-end gap-2 mt-2">
                                <h2 className="text-4xl font-bold">{formatRupiah(monthlyData?.income)}</h2>
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
                            <span className="text-sm font-medium text-emerald-100">Target</span>
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

                {/* Saldo Keluar Card - Enhanced */}
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-rose-100">Total Saldo Keluar</p>
                                <div className="text-xs px-2 py-1 bg-white/20 rounded-full flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                    </svg>
                                    <span>9%</span>
                                </div>
                            </div>
                            <h2 className="text-4xl font-bold mt-2">{formatRupiah(monthlyData?.expense)}</h2>
                        </div>
                        <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                        </div>
                    </div>

                    <div className="mt-6 flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataSideChart}>
                                <defs>
                                    <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff7a7a" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ff5252" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <Bar
                                    dataKey="value"
                                    fill="url(#colorRed)"
                                    radius={[6, 6, 0, 0]}
                                    barSize={20}
                                    animationDuration={2000}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {role !== 'admin' ? (
                <Table
                    isCompact
                    className='mt-5'
                    aria-label="Tabel Saldo"
                    bottomContent={
                        totalPages > 1 && (
                            <div className="flex w-full justify-center">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    classNames={{
                                        cursor: "bg-primaryGreen text-white cursor-pointer"
                                    }}
                                    color="primary"
                                    page={currentPage}
                                    total={totalPages}
                                    onChange={setCurrentPage}
                                />
                            </div>
                        )
                    }
                    classNames={{
                        wrapper: "min-h-[250px]",
                        th: 'bg-secondaryGreen text-white font-semibold',
                        td: 'text-black',
                    }}
                >
                    <TableHeader>
                        <TableColumn key="name">NAMA</TableColumn>
                        <TableColumn key="code">KODE</TableColumn>
                        <TableColumn key="type">TIPE</TableColumn>
                        <TableColumn key="normal_balance">NORMAL BALANCE</TableColumn>
                        <TableColumn key="balance">SALDO</TableColumn>
                        <TableColumn key="is_active">STATUS</TableColumn>
                        <TableColumn key="createdAt">DIBUAT</TableColumn>
                        <TableColumn key="actions">AKSI</TableColumn>
                    </TableHeader>
                    <TableBody
                        items={currentItems}
                        isLoading={loading}
                        loadingContent={<span>Memuat data...</span>}
                    >
                        {(item) => (
                            <TableRow key={item?._id}>
                                <TableCell>{item?.name}</TableCell>
                                <TableCell>{item?.code}</TableCell>
                                <TableCell>{item?.type}</TableCell>
                                <TableCell>{item?.normal_balance}</TableCell>
                                <TableCell>{formatCurrency(item?.balance ?? 0)}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${item?.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {item?.is_active ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </TableCell>
                                <TableCell>{formatDate(item?.createdAt)}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setId(item._id);
                                                setFormUpdate({
                                                    name: item.name,
                                                    code: item.code,
                                                    type: item.type,
                                                    normal_balance: item.normal_balance,
                                                    description: item.description || ''
                                                });
                                                onOpenUpdate();
                                            }}
                                            className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                                            disabled={updateLoading}
                                        >
                                            <RiEdit2Fill size={20} />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )
                : (
                    <Table
                        isCompact
                        className='mt-5'
                        aria-label="Tabel Saldo"
                        bottomContent={
                            totalPages > 1 && (
                                <div className="flex w-full justify-center">
                                    <Pagination
                                        isCompact
                                        showControls
                                        showShadow
                                        classNames={{
                                            cursor: "bg-primaryGreen text-white cursor-pointer"
                                        }}
                                        color="primary"
                                        page={currentPage}
                                        total={totalPages}
                                        onChange={setCurrentPage}
                                    />
                                </div>
                            )
                        }
                        classNames={{
                            wrapper: "min-h-[250px]",
                            th: 'bg-secondaryGreen text-white font-semibold',
                            td: 'text-black',
                        }}
                    >
                        <TableHeader>
                            <TableColumn key="name">NAMA</TableColumn>
                            <TableColumn key="code">KODE</TableColumn>
                            <TableColumn key="type">TIPE</TableColumn>
                            <TableColumn key="normal_balance">NORMAL BALANCE</TableColumn>
                            <TableColumn key="balance">SALDO</TableColumn>
                            <TableColumn key="is_active">STATUS</TableColumn>
                            <TableColumn key="createdAt">DIBUAT</TableColumn>

                        </TableHeader>
                        <TableBody
                            items={currentItems}
                            isLoading={loading}
                            loadingContent={<span>Memuat data...</span>}
                        >
                            {(item) => (
                                <TableRow key={item?._id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.code}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{item.normal_balance}</TableCell>
                                    <TableCell>{formatCurrency(item?.balance ?? 0)}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${item?.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {item?.is_active ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{formatDate(item?.createdAt)}</TableCell>

                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}


            <ModalDefault isOpen={isOpen} onClose={onClose} >
                <h1 className='text-xl font-bold my-4'>Tambah Akun</h1>
                <InputForm htmlFor="name" title="Nama Akun" type="text"
                    className='bg-slate-300 rounded-md mt-3 '
                    onChange={handleChange}
                    value={form.name} />

                <InputForm htmlFor="code" title="Kode Akun" type="text"
                    className='bg-slate-300 rounded-md '
                    onChange={handleChange}
                    value={form.code} />

                <div className="mb-3">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipe Akun</label>
                    <select
                        id="type"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="bg-slate-300 rounded-md w-full p-2 border border-gray-300"
                    >
                        <option value="">Pilih Tipe Akun</option>
                        <option value="asset">Asset</option>
                        <option value="liability">Liability</option>
                        <option value="equity">Equity</option>
                        <option value="revenue">Revenue</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="normal_balance" className="block text-sm font-medium text-gray-700 mb-1">Normal Balance</label>
                    <select
                        id="normal_balance"
                        name="normal_balance"
                        value={form.normal_balance}
                        onChange={handleChange}
                        className="bg-slate-300 rounded-md w-full p-2 border border-gray-300"
                    >
                        <option value="">Pilih Normal Balance</option>
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                    </select>
                </div>

                <InputForm htmlFor="description" title="Deskripsi" type="text"
                    className='bg-slate-300 rounded-md '
                    onChange={handleChange}
                    value={form.description} />

                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={onClose}>Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-2 rounded-xl' onClick={handleCreateAccount} disabled={createLoading}>
                        {createLoading ? 'Menyimpan...' : 'Simpan'}
                    </ButtonPrimary>
                </div>
            </ModalDefault>

            <ModalDefault isOpen={isOpenUpdate} onClose={onCloseUpdate} >
                <h1 className='text-xl font-bold my-4'>Edit Akun</h1>
                <InputForm htmlFor="name" title="Nama Akun" type="text"
                    className='bg-slate-300 rounded-md mt-3 '
                    onChange={handleChangeUpdate}
                    value={formUpdate.name} />

                <InputForm htmlFor="code" title="Kode Akun" type="text"
                    className='bg-slate-300 rounded-md '
                    onChange={handleChangeUpdate}
                    value={formUpdate.code} />

                <div className="mb-3">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipe Akun</label>
                    <select
                        id="type"
                        name="type"
                        value={formUpdate.type}
                        onChange={handleChangeUpdate}
                        className="bg-slate-300 rounded-md w-full p-2 border border-gray-300"
                    >
                        <option value="">Pilih Tipe Akun</option>
                        <option value="asset">Asset</option>
                        <option value="liability">Liability</option>
                        <option value="equity">Equity</option>
                        <option value="revenue">Revenue</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="normal_balance" className="block text-sm font-medium text-gray-700 mb-1">Normal Balance</label>
                    <select
                        id="normal_balance"
                        name="normal_balance"
                        value={formUpdate.normal_balance}
                        onChange={handleChangeUpdate}
                        className="bg-slate-300 rounded-md w-full p-2 border border-gray-300"
                    >
                        <option value="">Pilih Normal Balance</option>
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                    </select>
                </div>

                <InputForm htmlFor="description" title="Deskripsi" type="text"
                    className='bg-slate-300 rounded-md '
                    onChange={handleChangeUpdate}
                    value={formUpdate.description} />

                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={onCloseUpdate}>Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-2 rounded-xl' onClick={handleEditAccount} disabled={updateLoading}>
                        {updateLoading ? 'Mengubah...' : 'Simpan'}
                    </ButtonPrimary>
                </div>
            </ModalDefault>


        </DefaultLayout>
    )
}

export default page