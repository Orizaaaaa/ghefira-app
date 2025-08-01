'use client'
import { getAllCategory } from '@/api/method'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react'
import React, { useEffect, useState, useMemo } from 'react'

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setForm(prev => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleChangeUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormUpdate(prev => ({
            ...prev,
            [id]: value,
        }));
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <DefaultLayout>
            <div className="flex justify-end mb-4 gap-3">
                <ButtonSecondary className='py-2 px-4 rounded-lg' onClick={handleOpenCreate}>
                    + Tambah Kategori
                </ButtonSecondary>
            </div>

            {/* Category Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <Table
                    aria-label="Daftar Kategori"
                    isStriped
                    classNames={{
                        wrapper: "min-h-[400px]",
                        th: 'bg-gray-100 text-black font-semibold',
                        td: 'text-black',
                    }}
                    bottomContent={
                        pages > 1 && (
                            <div className="flex w-full justify-center py-4">
                                <Pagination
                                    isCompact
                                    showControls
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
                                <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                                <TableCell>{formatDate(item.createdAt)}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenUpdate(item)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleOpenDelete(item._id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add Category Modal */}
            <ModalDefault isOpen={isOpen} onClose={onClose}>
                <div className="space-y-4">
                    <InputForm
                        htmlFor="name"
                        title="Nama Kategori"
                        type="text"

                        onChange={handleChange}
                        value={form.name}
                    />

                    <InputForm
                        htmlFor="description"
                        title="Deskripsi"
                        type="text"

                        onChange={handleChange}
                        value={form.description}
                    />

                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                            Tipe Kategori
                        </label>
                        <select
                            id="type"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            onChange={handleChange}
                            value={form.type}
                        >
                            <option value="">Pilih Tipe</option>
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <ButtonSecondary onClick={onClose}>
                        Batal
                    </ButtonSecondary>
                    <ButtonPrimary>
                        Simpan
                    </ButtonPrimary>
                </div>
            </ModalDefault>

            {/* Edit Category Modal */}
            <ModalDefault isOpen={isOpenUpdate} onClose={onCloseUpdate} >
                <div className="space-y-4">
                    <InputForm
                        htmlFor="name"
                        title="Nama Kategori"
                        type="text"

                        onChange={handleChangeUpdate}
                        value={formUpdate.name}
                    />

                    <InputForm
                        htmlFor="description"
                        title="Deskripsi"
                        type="text"

                        onChange={handleChangeUpdate}
                        value={formUpdate.description}
                    />

                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                            Tipe Kategori
                        </label>
                        <select
                            id="type"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            onChange={handleChangeUpdate}
                            value={formUpdate.type}
                        >
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <ButtonSecondary onClick={onCloseUpdate}>
                        Batal
                    </ButtonSecondary>
                    <ButtonPrimary>
                        Simpan Perubahan
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
                    <ButtonSecondary onClick={onCloseDelete}>
                        Batal
                    </ButtonSecondary>
                    <ButtonPrimary className="bg-red-600 hover:bg-red-700">
                        Hapus
                    </ButtonPrimary>
                </div>
            </ModalAlert>
        </DefaultLayout>
    )
}

export default CategoryPage