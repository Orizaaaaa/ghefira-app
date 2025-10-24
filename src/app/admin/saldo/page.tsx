'use client'
import { createAccountingAccount, getAllAccountingAccounts, getSumaryMounth, updateAccountingAccount, getAllJournalEntries } from '@/api/method'
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
import { BiTrendingDown, BiTrendingUp } from 'react-icons/bi'
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
    const [journalData, setJournalData] = useState([] as any);
    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [chartData, setChartData] = useState([] as any);

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
                {/* Debit Card */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
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
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
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