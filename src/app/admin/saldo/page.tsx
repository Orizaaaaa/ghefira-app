'use client'
import { createSaldo, deleteSaldo, getAllSaldo, updateSaldo } from '@/api/method'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { getKeyValue, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react'
import { s } from 'framer-motion/client'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaPenSquare } from 'react-icons/fa'
import { IoMdTrash } from 'react-icons/io'
import { MdCheckBoxOutlineBlank } from 'react-icons/md'
import { RiEdit2Fill } from 'react-icons/ri'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Props = {}


interface Saldo {
    _id: string;
    name: string;
    amount: number;
    description: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface ApiResponse {
    meta: {
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
    data: Saldo[];
}

const page = (props: Props) => {
    const [id, setId] = useState('');
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure();
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

    const total = 16234;
    const current = 8445.98;
    const percentage = Math.round((current / total) * 100);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 4;
    const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
    const [saldoData, setSaldoData] = useState<Saldo[]>([]);

    const [form, setForm] = useState({
        name: '',
        amount: '',
        description: ''
    });

    const [formUpdate, setFormUpdate] = useState({
        name: '',
        amount: 0,
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

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getAllSaldo();
            setApiResponse(result);
            setSaldoData(result.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Calculate pagination
    const totalItems = apiResponse?.meta?.pagination?.total || 0;
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    // Get current page items
    const currentItems = React.useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return saldoData.slice(start, end);
    }, [currentPage, saldoData, rowsPerPage]);

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

    const handleCreateSaldo = async () => {
        const loadingToast = toast.loading('Menyimpan data saldo...');

        try {
            await createSaldo(form, (res: any) => {
                toast.success('Saldo berhasil ditambahkan', { id: loadingToast });

                fetchData();
                onClose();
                setForm({
                    name: '',
                    amount: '',
                    description: ''
                });
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal menambahkan saldo', { id: loadingToast });
        }
    };

    const handleEditSaldo = async () => {
        const loadingToast = toast.loading('Mengubah data saldo...');
        try {
            await updateSaldo(id, formUpdate, (res: any) => {
                toast.success('Saldo berhasil diubah', { id: loadingToast });

                fetchData();
                onCloseUpdate();
                setFormUpdate({
                    name: '',
                    amount: 0,
                    description: ''
                });
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengubah saldo', { id: loadingToast });
        }
    };

    const handleDeleteSaldo = async () => {
        const loadingToast = toast.loading('Menghapus data saldo...');
        try {
            await deleteSaldo(id);
            toast.success('Saldo berhasil dihapus', { id: loadingToast });
            fetchData();
            onCloseDelete();
        } catch (error) {
            console.error(error);
            toast.error('Gagal menghapus saldo', { id: loadingToast });
        }
    }


    return (
        <DefaultLayout>
            <div className=" flex justify-end mb-4 gap-3">
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={openModalCreate}> + Tambah Saldo </ButtonSecondary>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Saldo Masuk Card - Enhanced */}
                <div className="bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-emerald-100">Total Saldo Masuk</p>
                            <div className="flex items-end gap-2 mt-2">
                                <h2 className="text-4xl font-bold">${current}</h2>
                                <p className="text-lg text-emerald-100 mb-1">/ {total}</p>
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
                            <span className="text-sm font-medium text-emerald-100">Progress</span>
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
                            <h2 className="text-4xl font-bold mt-2">$11,239.00</h2>
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
                    <TableColumn key="amount">JUMLAH</TableColumn>
                    <TableColumn key="description">DESKRIPSI</TableColumn>
                    <TableColumn key="createdAt">DIBUAT</TableColumn>
                    <TableColumn key="updatedAt">DIPERBARUI</TableColumn>
                    <TableColumn key="actions">AKSI</TableColumn>
                </TableHeader>
                <TableBody
                    items={currentItems}
                    isLoading={loading}
                    loadingContent={<span>Memuat data...</span>}
                >
                    {(item) => (
                        <TableRow key={item._id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{formatCurrency(item.amount)}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{formatDate(item.createdAt)}</TableCell>
                            <TableCell>{formatDate(item.updatedAt)}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setId(item._id);
                                            setFormUpdate({
                                                name: item.name,
                                                amount: item.amount,
                                                description: item.description
                                            });
                                            onOpenUpdate();
                                        }}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <RiEdit2Fill size={20} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setId(item._id);
                                            onOpenDelete();
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

            <ModalDefault isOpen={isOpen} onClose={onClose} >
                <h1 className='text-xl font-bold my-4'>Tambah Saldo</h1>
                <InputForm htmlFor="name" title="Name" type="text"
                    className='bg-slate-300 rounded-md mt-3 '
                    onChange={handleChange}
                    value={form.name} />

                <InputForm htmlFor="amount" title="Jumlah" type="number"
                    className='bg-slate-300 rounded-md '
                    onChange={handleChange}
                    value={form.amount} />

                <InputForm htmlFor="description" title="Deskripsi" type="text"
                    className='bg-slate-300 rounded-md '
                    onChange={handleChange}
                    value={form.description} />

                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={onClose}>Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-2 rounded-xl' onClick={handleCreateSaldo}>Simpan</ButtonPrimary>
                </div>
            </ModalDefault>

            <ModalDefault isOpen={isOpenUpdate} onClose={onCloseUpdate} >
                <h1 className='text-xl font-bold my-4'>Edit Saldo</h1>
                <InputForm htmlFor="name" title="Name" type="text"
                    className='bg-slate-300 rounded-md mt-3 '
                    onChange={handleChangeUpdate}
                    value={formUpdate.name} />

                <InputForm htmlFor="amount" title="Jumlah" type="number"
                    className='bg-slate-300 rounded-md '
                    onChange={handleChangeUpdate}
                    value={formUpdate.amount} />

                <InputForm htmlFor="description" title="Deskripsi" type="text"
                    className='bg-slate-300 rounded-md '
                    onChange={handleChangeUpdate}
                    value={formUpdate.description} />

                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={onClose}>Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-2 rounded-xl' onClick={handleEditSaldo}>Simpan</ButtonPrimary>
                </div>
            </ModalDefault>

            <ModalAlert isOpen={isOpenDelete} onClose={onCloseDelete}>
                <h1>Apakah anda yakin ingin menghapus saldo ini?</h1>
                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={onCloseDelete}>Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-2 rounded-xl' onClick={handleDeleteSaldo}>Hapus</ButtonPrimary>
                </div>
            </ModalAlert>

        </DefaultLayout>
    )
}

export default page