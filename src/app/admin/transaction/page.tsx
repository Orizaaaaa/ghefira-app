'use client'
import { createJournalEntry, deleteJournalEntry, getAllJournalEntries, updateJournalEntry, downloadJournalEntries } from '@/api/method'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useAuth } from '@/hook/AuthContext'
import { formatDate, formatRupiah } from '@/utils/helper'
import { Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react'
import React, { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { BiTrendingDown, BiTrendingUp } from 'react-icons/bi'
import { BsBox } from 'react-icons/bs'
import { IoMdTrash } from 'react-icons/io'
import { RiEdit2Fill } from 'react-icons/ri'
import { FiDownload } from 'react-icons/fi'

interface Account {
    _id: string;
    name: string;
    code: string;
    type: string;
    display_balance: number | null;
    id: string;
}

interface JournalEntryItem {
    account: Account;
    debit: number;
    credit: number;
    description: string;
    _id: string;
}

interface JournalEntry {
    _id: string;
    transaction_date: string;
    description: string;
    entries: JournalEntryItem[];
    user: string;
    status: string;
    predicted_category: string;
    ml_confidence: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface ApiResponse {
    code: number;
    status: string;
    data: {
        journalEntries: JournalEntry[];
    };
}

interface CreateJournalResponse {
    code: number;
    status: string;
    data: {
        journalEntry: JournalEntry;
        prediction: {
            category: string;
            confidence: number;
            auto_categorized: boolean;
        };
        message: string;
    };
}

type Props = {}

const Page = (props: Props) => {
    const { role } = useAuth();
    const [id, setId] = useState('');
    const [journalEntries, setJournalEntries] = useState<ApiResponse | null>(null);
    const [journalData, setJournalData] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure();
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();
    const { isOpen: isOpenDownload, onOpen: onOpenDownload, onClose: onCloseDownload } = useDisclosure();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [form, setForm] = useState({
        description: '',
        amount: '',
        type: '',
        date: ''
    });

    const [downloadLoading, setDownloadLoading] = useState(false);

    const [formUpdate, setFormUpdate] = useState({
        transaction_date: '',
        description: '',
        entries: [
            {
                account: '',
                debit: '',
                credit: '',
                description: ''
            }
        ]
    })

    const totalItems = Array.isArray(journalData) ? journalData.length : 0;
    // Hitung total halaman asli
    const calculatedTotalPages = Math.ceil(totalItems / rowsPerPage);
    const totalPages = Math.max(calculatedTotalPages, 20);

    // Get current page items
    const currentItems = useMemo(() => {
        if (!Array.isArray(journalData)) return [];
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return journalData.slice(start, end);
    }, [currentPage, journalData, rowsPerPage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const handleOpenDownload = () => {
        onOpenDownload();
    }

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getAllJournalEntries();
            console.log('Journal Entries Response:', result);
            setJournalEntries(result);

            // Handle different response structures and filter by status "posted"
            let entries = [];
            if (result && result.data && result.data.journalEntries && Array.isArray(result.data.journalEntries)) {
                entries = result.data.journalEntries;
            } else if (result && Array.isArray(result)) {
                entries = result;
            } else {
                console.warn('Unexpected API response structure:', result);
                entries = [];
            }

            // Filter only entries with status "posted"
            const postedEntries = entries.filter((entry: JournalEntry) => entry.status === 'posted');
            setJournalData(postedEntries);
        } catch (error) {
            console.error('Error fetching data:', error);
            setJournalData([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateJournalEntry = async () => {
        const { description, amount, type, date } = form;

        if (!description || !amount || !type || !date) {
            toast.error('Semua data harus diisi!');
            return;
        }

        const toastId = toast.loading('Menyimpan jurnal...');
        try {
            await createJournalEntry(form, (res: CreateJournalResponse) => {
                console.log('Create Response:', res);

                // Show prediction information if available
                if (res.data && res.data.prediction) {
                    const { category, confidence, auto_categorized } = res.data.prediction;
                    if (auto_categorized) {
                        toast.success(`Jurnal berhasil ditambahkan! Kategori diprediksi: ${category} (${Math.round(confidence * 100)}%)`, {
                            id: toastId,
                            duration: 5000
                        });
                    } else {
                        toast.success('Jurnal berhasil ditambahkan!', { id: toastId });
                    }
                } else {
                    toast.success('Jurnal berhasil ditambahkan!', { id: toastId });
                }

                fetchData();
                onClose();
                setForm({
                    description: '',
                    amount: '',
                    type: '',
                    date: ''
                });
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal menambahkan jurnal', { id: toastId });
        }
    };

    const handleDelete = async () => {
        const toastId = toast.loading('Menghapus jurnal...');
        try {
            await deleteJournalEntry(id);
            fetchData();
            onCloseDelete();
            toast.success('Jurnal berhasil dihapus!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Gagal menghapus jurnal.', { id: toastId });
        }
    }

    const handleDownload = async () => {
        setDownloadLoading(true);
        const toastId = toast.loading('Mengunduh data Excel...');

        try {
            await downloadJournalEntries((blob: Blob, err: any) => {
                if (err) {
                    toast.error('Gagal mengunduh data Excel', { id: toastId });
                    console.error(err);
                } else {
                    // Create download link
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `journal-entries-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                    toast.success('Data Excel berhasil diunduh!', { id: toastId });
                    onCloseDownload();
                }
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengunduh data Excel', { id: toastId });
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleEditJournalEntry = async () => {
        const { transaction_date, description, entries } = formUpdate;

        if (!transaction_date || !description || !entries || entries.length === 0) {
            toast.error('Semua data harus diisi!');
            return;
        }

        const toastId = toast.loading('Mengubah jurnal...');
        try {
            await updateJournalEntry(id, formUpdate, (res: any) => {
                console.log(res);
                fetchData();
                toast.success('Jurnal berhasil diubah!', { id: toastId });
                onCloseUpdate();
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengubah jurnal.', { id: toastId });
        }
    };

    // Calculate totals from journal entries
    let totalDebit = 0;
    let totalCredit = 0;

    journalData.forEach(entry => {
        entry.entries.forEach(journalEntry => {
            totalDebit += journalEntry.debit;
            totalCredit += journalEntry.credit;
        });
    });

    console.log('Journal Entries:', journalData);

    return (
        <DefaultLayout>
            <div className={`flex justify-end mb-4 gap-3  ${role === 'admin' && 'hidden'}`}>
                <ButtonSecondary className='py-1 px-2 rounded-xl flex items-center gap-2' onClick={handleOpenDownload}>
                    <FiDownload  size={16} />
                    Download Exceld
                </ButtonSecondary>
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={handleOpenCreate}> + Tambah Jurnal </ButtonSecondary>
            </div>

            <div className={`block md:flex justify-between items-center mb-5 `}>

            </div>

            <div className="flex flex-col gap-6">

                {/* Statistik Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <BsBox className="text-blue-500 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Jurnal</p>
                            <h2 className="text-xl font-bold">{journalData.length}</h2>
                        </div>
                    </div>
                    <div className="bg-green-100 p-4 rounded-xl shadow flex items-center gap-4">
                        <div className="bg-green-200 p-2 rounded-full">
                            <BiTrendingUp className="text-green-800 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-green-800 text-sm">Total Debit</p>
                            <h2 className="text-lg font-semibold text-green-900">{formatRupiah(totalDebit)}</h2>
                        </div>
                    </div>
                    <div className="bg-red-100 p-4 rounded-xl shadow flex items-center gap-4">
                        <div className="bg-red-200 p-2 rounded-full">
                            <BiTrendingDown className="text-red-800 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-red-800 text-sm">Total Credit</p>
                            <h2 className="text-lg font-semibold text-red-900">{formatRupiah(totalCredit)}</h2>
                        </div>
                    </div>
                </div>
            </div>
            {role === 'admin' ? (
                <Table
                    isCompact
                    className='mt-5'
                    aria-label="Tabel Jurnal"
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
                        <TableColumn key="transaction_date">TANGGAL</TableColumn>
                        <TableColumn key="description">DESKRIPSI</TableColumn>
                        <TableColumn key="status">STATUS</TableColumn>
                        <TableColumn key="entries">JURNAL</TableColumn>
                        <TableColumn key="createdAt">DIBUAT</TableColumn>
                    </TableHeader>
                    <TableBody
                        items={currentItems}
                        isLoading={loading}
                        loadingContent={<span>Memuat data...</span>}
                    >
                        {(item: JournalEntry) => (
                            <TableRow key={item?._id}>
                                <TableCell className='text-sm'>{formatDate(item.transaction_date)}</TableCell>
                                <TableCell className='text-sm'>{item.description}</TableCell>
                                <TableCell className='text-sm'>
                                    <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'posted'
                                        ? 'bg-green-100 text-green-800'
                                        : item.status === 'draft'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {item.status.toUpperCase()}
                                    </span>
                                </TableCell>
                                <TableCell className='text-sm'>
                                    <div className="space-y-1">
                                        {item.entries.map((entry, index) => (
                                            <div key={index} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                                                <div className="flex-1">
                                                    <div className="font-medium">{entry.account.name}</div>
                                                    <div className="text-gray-500">{entry.account.code}</div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="text-right">
                                                        <div className="text-gray-500">Debit</div>
                                                        <div className="font-medium">{entry.debit > 0 ? formatRupiah(entry.debit) : '-'}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-gray-500">Credit</div>
                                                        <div className="font-medium">{entry.credit > 0 ? formatRupiah(entry.credit) : '-'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className='text-sm'>{formatDate(item.createdAt)}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

            ) : (
                <Table
                    isCompact
                    className='mt-5'
                    aria-label="Tabel Jurnal"
                    bottomContent={
                        <div className="flex w-full justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Menampilkan {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)}-
                                {Math.min(currentPage * rowsPerPage, totalItems)} dari {totalItems} jurnal
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
                        <TableColumn key="transaction_date">TANGGAL</TableColumn>
                        <TableColumn key="description">DESKRIPSI</TableColumn>
                        <TableColumn key="status">STATUS</TableColumn>
                        <TableColumn key="entries">JURNAL</TableColumn>
                        <TableColumn key="actions">AKSI</TableColumn>
                    </TableHeader>
                    <TableBody
                        items={currentItems}
                        isLoading={loading}
                        loadingContent={<span>Memuat data...</span>}
                    >
                        {(item: JournalEntry) => (
                            <TableRow key={item?._id}>
                                <TableCell className='text-sm'>{formatDate(item.transaction_date)}</TableCell>
                                <TableCell className='text-sm'>{item.description}</TableCell>
                                <TableCell className='text-sm'>
                                    <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'posted'
                                        ? 'bg-green-100 text-green-800'
                                        : item.status === 'draft'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {item.status.toUpperCase()}
                                    </span>
                                </TableCell>
                                <TableCell className='text-sm'>
                                    <div className="space-y-1">
                                        {item.entries.map((entry, index) => (
                                            <div key={index} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                                                <div className="flex-1">
                                                    <div className="font-medium">{entry.account.name}</div>
                                                    <div className="text-gray-500">{entry.account.code}</div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="text-right">
                                                        <div className="text-gray-500">Debit</div>
                                                        <div className="font-medium">{entry.debit > 0 ? formatRupiah(entry.debit) : '-'}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-gray-500">Credit</div>
                                                        <div className="font-medium">{entry.credit > 0 ? formatRupiah(entry.credit) : '-'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className='text-sm'>
                                    <div className="flex gap-2">
                                        {/* <button
                                            onClick={() => {
                                                setId(item._id);
                                                setFormUpdate({
                                                    transaction_date: item.transaction_date,
                                                    description: item.description,
                                                    entries: item.entries.map(entry => ({
                                                        account: entry.account._id,
                                                        debit: entry.debit.toString(),
                                                        credit: entry.credit.toString(),
                                                        description: entry.description
                                                    }))
                                                });
                                                handleOpenUpdate();
                                            }}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <RiEdit2Fill size={20} />
                                        </button> */}
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
                <h1 className='text-xl font-bold my-4'>Tambah Jurnal</h1>

                <InputForm
                    htmlFor="description"
                    title="Deskripsi"
                    type="text"
                    className="bg-slate-100 rounded-md"
                    onChange={handleChange}
                    value={form.description}
                />

                <InputForm
                    htmlFor="amount"
                    title="Jumlah"
                    type="number"
                    className="bg-slate-100 rounded-md"
                    onChange={handleChange}
                    value={form.amount}
                />

                <div className="mb-3">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                    <select
                        id="type"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="bg-slate-100 rounded-md w-full p-2 border border-gray-300"
                    >
                        <option value="">Pilih Tipe</option>
                        <option value="revenue">income</option>
                        <option value="expense">expense</option>
                    </select>
                </div>


                <InputForm
                    htmlFor="date"
                    title="Tanggal"
                    type="date"
                    className="bg-slate-100 rounded-md"
                    onChange={handleChange}
                    value={form.date}
                />

                <div className="flex justify-end gap-2 mt-4">
                    <ButtonSecondary className="py-1 px-2 rounded-xl" onClick={onClose}>
                        Batal
                    </ButtonSecondary>
                    <ButtonPrimary className="py-1 px-2 rounded-xl" onClick={handleCreateJournalEntry}>
                        Simpan
                    </ButtonPrimary>
                </div>
            </ModalDefault>

            <ModalDefault isOpen={isOpenUpdate} onClose={onCloseUpdate}>
                <h1 className='text-xl font-bold my-4'>Edit Jurnal</h1>

                <InputForm
                    htmlFor="transaction_date"
                    title="Tanggal Transaksi"
                    type="date"
                    className="bg-slate-100 rounded-md"
                    onChange={handleChangeUpdate}
                    value={formUpdate.transaction_date}
                />

                <InputForm
                    htmlFor="description"
                    title="Deskripsi"
                    type="text"
                    className="bg-slate-100 rounded-md"
                    onChange={handleChangeUpdate}
                    value={formUpdate.description}
                />

                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Entries Jurnal</h3>
                    {formUpdate.entries.map((entry, index) => (
                        <div key={index} className="border p-3 rounded-lg mb-3 bg-gray-50">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Akun</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={entry.account}
                                        onChange={(e) => {
                                            const newEntries = [...formUpdate.entries];
                                            newEntries[index].account = e.target.value;
                                            setFormUpdate({ ...formUpdate, entries: newEntries });
                                        }}
                                    >
                                        <option value="">Pilih Akun</option>
                                        {/* Add account options here */}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Deskripsi</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded"
                                        value={entry.description}
                                        onChange={(e) => {
                                            const newEntries = [...formUpdate.entries];
                                            newEntries[index].description = e.target.value;
                                            setFormUpdate({ ...formUpdate, entries: newEntries });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Debit</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={entry.debit}
                                        onChange={(e) => {
                                            const newEntries = [...formUpdate.entries];
                                            newEntries[index].debit = e.target.value;
                                            setFormUpdate({ ...formUpdate, entries: newEntries });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Credit</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={entry.credit}
                                        onChange={(e) => {
                                            const newEntries = [...formUpdate.entries];
                                            newEntries[index].credit = e.target.value;
                                            setFormUpdate({ ...formUpdate, entries: newEntries });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="text-blue-500 text-sm"
                        onClick={() => {
                            setFormUpdate({
                                ...formUpdate,
                                entries: [...formUpdate.entries, {
                                    account: '',
                                    debit: '',
                                    credit: '',
                                    description: ''
                                }]
                            });
                        }}
                    >
                        + Tambah Entry
                    </button>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <ButtonSecondary className="py-1 px-2 rounded-xl" onClick={onCloseUpdate}>
                        Batal
                    </ButtonSecondary>
                    <ButtonPrimary className="py-1 px-2 rounded-xl" onClick={handleEditJournalEntry}>
                        Simpan
                    </ButtonPrimary>
                </div>
            </ModalDefault>

            <ModalAlert isOpen={isOpenDelete} onClose={onCloseDelete}>
                <h1>Apakah anda yakin ingin menghapus jurnal ini?</h1>
                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={onCloseDelete}>Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-2 rounded-xl' onClick={handleDelete}>Hapus</ButtonPrimary>
                </div>
            </ModalAlert>

            <ModalDefault isOpen={isOpenDownload} onClose={onCloseDownload}>
                <h1 className='text-xl font-bold my-4'>Download Data Excel</h1>

                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center mb-2">
                        <FiDownload className="text-blue-600 mr-2" size={20} />
                        <h3 className="text-lg font-semibold text-blue-800">Export Journal Entries</h3>
                    </div>
                    <p className="text-sm text-blue-700">
                        Klik tombol download untuk mengunduh data journal entries dalam format Excel.
                    </p>
                </div>

                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-700">
                        <strong>Informasi:</strong> File Excel akan berisi semua data journal entries yang tersimpan dalam sistem.
                    </p>
                </div>

                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={onCloseDownload}>
                        Batal
                    </ButtonSecondary>
                    <ButtonPrimary
                        className='py-1 px-2 rounded-xl'
                        onClick={handleDownload}
                        disabled={downloadLoading}
                    >
                        {downloadLoading ? 'Mengunduh...' : 'Download Excel'}
                    </ButtonPrimary>
                </div>
            </ModalDefault>

        </DefaultLayout>
    )
}

export default Page