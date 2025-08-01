'use client'
import { getAllCategory, getAllSaldo, getAllTransaction } from '@/api/method'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { formatDate, formatDateWithDays, formatRupiah } from '@/utils/helper'
import { Autocomplete, AutocompleteItem, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react'
import React, { useEffect, useState, useMemo } from 'react'
import { IoMdTrash } from 'react-icons/io'
import { RiEdit2Fill } from 'react-icons/ri'
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts'

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
    const [rowsPerPage, setRowsPerPage] = useState(5);

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

    const data = [
        {
            name: 'Spent',
            value: 50,
            fill: '#3B82F6',
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

    const type = [
        { label: "Pendapatan", key: "income" },
        { label: "Pengeluaran", key: "expense" },
    ];

    const total = 2000;
    const spent = 1000;
    const left = total - spent;

    console.log(transaction);


    return (
        <DefaultLayout>
            <div className="flex justify-end mb-4 gap-3">
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={handleOpenCreate}> + Tambah Transaksi </ButtonSecondary>
            </div>

            <div className="mx-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-black">My Budget</h2>
                    <button className="text-sm text-gray-500 hover:underline">View all →</button>
                </div>

                <div className="relative bg-slate-200 rounded-xl flex flex-col items-center py-3">
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

                    <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-sm text-gray-500">Total to spend</p>
                        <p className="text-2xl font-bold text-blue-600">${total.toLocaleString()}</p>
                    </div>

                    <div className="w-full flex justify-around text-sm">
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
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.category.name}</TableCell>
                            <TableCell>{item.saldo.name}</TableCell>
                            <TableCell className={item.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                {formatRupiah(item.amount)}
                            </TableCell>
                            <TableCell>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${item.type === 'income'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {item.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
                                </span>
                            </TableCell>

                            <TableCell>{formatDateWithDays(item.createdAt)}</TableCell>
                            <TableCell>
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
                    <ButtonPrimary className="py-1 px-2 rounded-xl">
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

export default Page