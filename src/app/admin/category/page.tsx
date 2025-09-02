'use client'
import { createCategory, deleteCategory, getAllCategory, updateCategory } from '@/api/method'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useAuth } from '@/hook/AuthContext'
import { formatDateWithDays } from '@/utils/helper'
import { Autocomplete, AutocompleteItem, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react'
import React, { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { BsBox } from 'react-icons/bs'
import { FiFolder, FiTrendingDown, FiTrendingUp } from 'react-icons/fi'
import { IoMdTrash } from 'react-icons/io'
import { RiEdit2Fill } from 'react-icons/ri'

type Category = {
    _id: string;
    name: string;
    type: 'income' | 'expense';
    description: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
};

const CategoryPage = () => {
    const { role } = useAuth();
    const [id, setId] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure();
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

    // Pagination state
    const [page, setPage] = useState(1);
    const rowsPerPage = 4;
    const pages = Math.ceil(categories.length / rowsPerPage);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return categories.slice(start, end);
    }, [page, categories]);

    const [form, setForm] = useState({
        name: '',
        type: '',
        description: '',
    });

    const [formUpdate, setFormUpdate] = useState({
        name: '',
        type: '',
        description: '',
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getAllCategory();
            setCategories(result.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleChangeUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormUpdate({ ...formUpdate, [e.target.name]: e.target.value });
    };

    const handleOpenCreate = () => {
        setForm({
            name: '',
            type: '',
            description: ''
        });
        onOpen();
    };

    const handleOpenUpdate = (category: Category) => {
        setId(category._id);
        setFormUpdate({
            name: category.name,
            type: category.type,
            description: category.description
        });
        onOpenUpdate();
    };

    const handleOpenDelete = (id: string) => {
        setId(id);
        onOpenDelete();
    };


    const type = [
        { label: "Pendapatan", key: "income" },
        { label: "Pengeluaran", key: "expense" },
    ];

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


    const handleUpdate = async () => {
        const { name, type, description } = formUpdate;

        if (!name || !type || !description) {
            toast.error('Semua data harus diisi!');
            return;
        }

        const toastId = toast.loading('Memperbarui kategori...');
        try {
            await updateCategory(id, formUpdate, (result: any) => {
                toast.success('Kategori berhasil diperbarui!', { id: toastId });
                fetchData();
                onCloseUpdate();
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal memperbarui kategori', { id: toastId });
        }
    };


    const handleDelete = async () => {
        const toastId = toast.loading('Menghapus kategori...');
        try {
            await deleteCategory(id, (result: any) => {
                toast.success('Kategori berhasil dihapus!', { id: toastId });
                fetchData();
                onCloseDelete();
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal menghapus kategori', { id: toastId });
        }
    };

    const handleCreate = async () => {
        const { name, type, description } = form;

        if (!name || !type || !description) {
            toast.error('Semua data harus diisi!');
            return;
        }

        const toastId = toast.loading('Menambah kategori...');
        try {
            await createCategory(form, (result: any) => {
                toast.success('Kategori berhasil ditambahkan!', { id: toastId });
                fetchData();
                onClose();
            });
        } catch (error) {
            console.error(error);
            toast.error('Gagal menambah kategori', { id: toastId });
        }
    };



    return (
        <DefaultLayout>
            <div className="flex justify-end mb-4 gap-3">
                <ButtonSecondary className={`py-2 px-4 rounded-lg   ${role !== 'admin' && 'hidden'} `} onClick={handleOpenCreate}>
                    + Tambah Kategori
                </ButtonSecondary>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl shadow-lg flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                        <BsBox size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Kategori</p>
                        <h2 className="text-2xl font-bold text-gray-800">{categories.length}</h2>
                    </div>
                </div>

                <div className="bg-green-50 p-5 rounded-2xl shadow-lg flex items-center gap-4">
                    <div className="bg-green-200 text-green-700 p-3 rounded-full">
                        <FiTrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-green-600">Kategori Pendapatan</p>
                        <h2 className="text-xl font-semibold text-green-800">
                            {categories.filter((c) => c.type === 'income').length}
                        </h2>
                    </div>
                </div>

                <div className="bg-red-50 p-5 rounded-2xl shadow-lg flex items-center gap-4">
                    <div className="bg-red-200 text-red-700 p-3 rounded-full">
                        <FiTrendingDown size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-red-600">Kategori Pengeluaran</p>
                        <h2 className="text-xl font-semibold text-red-800">
                            {categories.filter((c) => c.type === 'expense').length}
                        </h2>
                    </div>
                </div>
            </div>


            {/* Category Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {role !== 'admin' ? (
                    <Table
                        aria-label="Daftar Kategori"
                        isStriped
                        classNames={{
                            wrapper: "min-h-[250px]",
                            th: 'bg-secondaryGreen text-white font-semibold',
                            td: 'text-black',
                        }}
                        bottomContent={
                            pages > 1 && (
                                <div className="flex w-full justify-center py-4">
                                    <Pagination
                                        isCompact
                                        showControls
                                        classNames={{
                                            cursor: "bg-primaryGreen text-white cursor-pointer"
                                        }}
                                        color="primary"
                                        page={page}
                                        total={pages}
                                        onChange={setPage}
                                    />
                                </div>
                            )
                        }
                    >
                        <TableHeader>
                            <TableColumn>NAMA</TableColumn>
                            <TableColumn>TIPE</TableColumn>
                            <TableColumn>DESKRIPSI</TableColumn>
                            <TableColumn>TANGGAL DIBUAT</TableColumn>
                        </TableHeader>
                        <TableBody
                            items={items}
                            isLoading={loading}
                            loadingContent={<span>Memuat data...</span>}
                        >
                            {(item) => (
                                <TableRow key={item?._id}>
                                    <TableCell>{item?.name}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'income'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {item?.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{item?.description}</TableCell>
                                    <TableCell>{formatDateWithDays(item?.createdAt)}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                ) : (
                    <Table
                        aria-label="Daftar Kategori"
                        isStriped
                        classNames={{
                            wrapper: "min-h-[250px]",
                            th: 'bg-secondaryGreen text-white font-semibold',
                            td: 'text-black',
                        }}
                        bottomContent={
                            pages > 1 && (
                                <div className="flex w-full justify-center py-4">
                                    <Pagination
                                        isCompact
                                        showControls
                                        classNames={{
                                            cursor: "bg-primaryGreen text-white cursor-pointer"
                                        }}
                                        color="primary"
                                        page={page}
                                        total={pages}
                                        onChange={setPage}
                                    />
                                </div>
                            )
                        }
                    >
                        <TableHeader>
                            <TableColumn>NAMA</TableColumn>
                            <TableColumn>TIPE</TableColumn>
                            <TableColumn>DESKRIPSI</TableColumn>
                            <TableColumn>TANGGAL DIBUAT</TableColumn>
                            <TableColumn>AKSI</TableColumn>
                        </TableHeader>
                        <TableBody
                            items={items}
                            isLoading={loading}
                            loadingContent={<span>Memuat data...</span>}
                        >
                            {(item) => (
                                <TableRow key={item._id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'income'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{item?.description}</TableCell>
                                    <TableCell>{formatDateWithDays(item?.createdAt)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenUpdate(item)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <RiEdit2Fill size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenDelete(item?._id)}
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

            </div>

            {/* Add Category Modal */}
            <ModalDefault isOpen={isOpen} onClose={onClose}>
                <h1 className="text-2xl font-semibold mb-4" >Tambah Kategori</h1>
                <div className="space-y-4">
                    <InputForm
                        styleTitle='mb-2'
                        htmlFor="name"
                        title="Nama Kategori"
                        type="text"
                        className="bg-slate-100 rounded-md mb-3"
                        onChange={handleChange}
                        value={form.name}
                    />

                    <InputForm
                        styleTitle='mb-2'
                        htmlFor="description"
                        title="Deskripsi"
                        type="text"
                        className="bg-slate-100 rounded-md mb-3"
                        onChange={handleChange}
                        value={form.description}
                    />

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

                <div className="flex justify-end gap-3 mt-6">
                    <ButtonSecondary className="py-1 px-2 rounded-xl" onClick={onClose}>
                        Batal
                    </ButtonSecondary>
                    <ButtonPrimary className="py-1 px-2 rounded-xl" onClick={handleCreate} >
                        Simpan
                    </ButtonPrimary>
                </div>
            </ModalDefault>

            {/* Edit Category Modal */}
            <ModalDefault isOpen={isOpenUpdate} onClose={onCloseUpdate} >
                <h1 className="text-2xl font-semibold mb-4" >Edit Kategori</h1>
                <div className="space-y-4">
                    <InputForm
                        htmlFor="name"
                        title="Nama Kategori"
                        type="text"
                        className="bg-slate-100 rounded-md mb-3 py-4"
                        onChange={handleChangeUpdate}
                        value={formUpdate.name}
                    />

                    <InputForm
                        htmlFor="description"
                        title="Deskripsi"
                        type="text"
                        className="bg-slate-100 rounded-md mb-3 py-4"
                        onChange={handleChangeUpdate}
                        value={formUpdate.description}
                    />

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

                <div className="flex justify-end gap-3 mt-6">
                    <ButtonSecondary className="py-1 px-2 rounded-xl" onClick={onCloseUpdate}>
                        Batal
                    </ButtonSecondary>
                    <ButtonPrimary className="py-1 px-2 rounded-xl" onClick={handleUpdate}>
                        Simpan
                    </ButtonPrimary>
                </div>
            </ModalDefault>

            {/* Delete Confirmation Modal */}
            <ModalAlert
                isOpen={isOpenDelete}
                onClose={onCloseDelete}
            >
                <p className="mb-6">Apakah Anda yakin ingin menghapus kategori ini?</p>
                <div className="flex justify-end gap-3">
                    <div className="flex justify-end gap-2">
                        <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={onCloseDelete}>Batal</ButtonSecondary>
                        <ButtonPrimary className='py-1 px-2 rounded-xl' onClick={handleDelete}>Hapus</ButtonPrimary>
                    </div>
                </div>
            </ModalAlert>
        </DefaultLayout>
    )
}

export default CategoryPage