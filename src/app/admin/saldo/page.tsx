'use client'
import { getAllSaldo } from '@/api/method'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { getKeyValue, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react'
import { s } from 'framer-motion/client'
import React, { useEffect, useState } from 'react'
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


    const openModalUpdate = () => {
        onOpenUpdate();
    }
    const openModalCreate = () => {
        onOpen();
    }

    const openModalDelete = () => {
        onOpenDelete();
    }
    console.log(apiResponse);


    return (
        <DefaultLayout>
            <div className=" flex justify-end mb-4 gap-3">
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={openModalCreate}> + Tambah Saldo </ButtonSecondary>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Saldo Masuk Card */}
                <div className="bg-primaryGreen rounded-xl p-4 text-white shadow-md h-full flex flex-col">
                    <p className="text-sm text-gray-200">Saldo Masuk</p>
                    <h2 className="text-3xl font-bold">${current}</h2>
                    <p className="text-sm text-gray-300">/ {total}</p>
                    <p className="mt-2 text-sm text-gray-200">{percentage}% </p>
                    <div className="mt-2 flex gap-[2px] flex-grow items-end">
                        {Array.from({ length: 100 }, (_, i) => (
                            <div
                                key={i}
                                className={`h-2 w-[2px] rounded-sm ${i < percentage ? 'bg-white' : 'bg-gray-700'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Saldo Keluar Card */}
                <div className="bg-primaryGreen rounded-xl p-4 text-white shadow-md h-full flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-gray-200">Saldo Keluar</p>
                        <div className="text-xs text-red-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full" />
                            -9%
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">$11,239.00</h2>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataSideChart}>
                                <Bar dataKey="value" fill="#ff5c5c" radius={[4, 4, 0, 0]} barSize={25} />
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