'use client';

import ButtonPrimary from '@/components/elements/buttonPrimary';
import ButtonSecondary from '@/components/elements/buttonSecondary';
import ModalDefault from '@/components/fragments/modal/modal';
import ModalAlert from '@/components/fragments/modal/modalAlert';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import { db } from '@/lib/firebase/firebaseConfig';
import { formatDate, formatDateStr, formatRupiah } from '@/utils/helper';
import {
    getKeyValue, Table, TableBody, TableCell, TableColumn, TableHeader,
    TableRow, Input, Button, Pagination,
    useDisclosure,
    Autocomplete,
    AutocompleteItem
} from '@heroui/react';
import axios from 'axios';
import { collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BiEditAlt } from 'react-icons/bi';
import { FaTrash } from 'react-icons/fa6';
import { IoLogoWhatsapp } from 'react-icons/io5';

type Borrowing = {
    key: string;
    user_name: string;
    book_title: string;
    status: string;
    phone: string
    tanggal_pinjam: any;
    tanggal_kembali: any;
};

const page = () => {
    const [borrowingId, setBorrowingId] = useState('');
    const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure();
    const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
    const { onOpen, onClose, isOpen } = useDisclosure();
    const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
    const [filteredBorrowings, setFilteredBorrowings] = useState<Borrowing[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [nameFilter, setNameFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [form, setForm] = useState({
        status: ''
    })

    // Reordered columns: peminjaman first, then pengembalian
    const columns = [
        { key: 'user_name', label: 'NAMA SISWA' },
        { key: 'book_title', label: 'JUDUL BUKU' },
        { key: 'status', label: 'STATUS' },
        { key: 'tanggal_pinjam', label: 'TANGGAL PINJAM' },
        { key: 'tanggal_kembali', label: 'DEADLINE MENGEMBALIKAN' },
        { key: 'denda', label: 'DENDA BUKU' },
        { key: 'actions', label: 'ACTIONS' },
    ];

    // Status options for filter buttons
    const statusOptions = [
        { value: 'all', label: 'Semua' },
        { value: 'dipinjam', label: 'Dipinjam' },
        { value: 'belum diambil', label: 'Belum diambil' },
        { value: 'dikembalikan', label: 'Dikembalikan' },
        { value: 'terlambat', label: 'Terlambat' },
        { value: 'hilang', label: 'Hilang' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, 'borrowings'));
            const data = querySnapshot.docs.map((doc) => ({
                key: doc.id,
                ...doc.data(),
            })) as Borrowing[];

            setBorrowings(data);
            setFilteredBorrowings(data);
        };

        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...borrowings];

        if (statusFilter !== 'all') {
            filtered = filtered.filter((item) => item.status === statusFilter);
        }

        if (nameFilter.trim() !== '') {
            filtered = filtered.filter((item) =>
                item.user_name.toLowerCase().includes(nameFilter.toLowerCase())
            );
        }

        // Urutkan berdasarkan tanggal_kembali ASC, dan status "dikembalikan" di bawah
        filtered.sort((a, b) => {
            // Tempel status "dikembalikan" di bawah
            if (a.status === "dikembalikan" && b.status !== "dikembalikan") return 1;
            if (a.status !== "dikembalikan" && b.status === "dikembalikan") return -1;

            const dateA = a.tanggal_kembali?.seconds
                ? new Date(a.tanggal_kembali.seconds * 1000)
                : new Date();
            const dateB = b.tanggal_kembali?.seconds
                ? new Date(b.tanggal_kembali.seconds * 1000)
                : new Date();

            return dateA.getTime() - dateB.getTime(); // ASC: tanggal terlama ke terbaru
        });

        setFilteredBorrowings(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [statusFilter, nameFilter, borrowings]);


    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBorrowings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBorrowings.length / itemsPerPage);

    function formatDate(value: any): string {
        if (value && typeof value === 'object' && value.seconds) {
            const date = new Date(value.seconds * 1000);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        }
        return value?.toString?.() ?? '-';
    }

    // untuk update status peminjaman otomatis
    const updateBorrowingStatuses = async (data: Borrowing[]) => {
        const now = new Date();

        const updated = await Promise.all(
            data.map(async (item: any) => {
                if (item.status !== "dikembalikan") {
                    const tanggalPinjam = new Date(item.tanggal_pinjam.seconds * 1000);

                    const batasKembali = new Date(tanggalPinjam);
                    batasKembali.setDate(batasKembali.getDate() + 7);

                    const diffMs = now.getTime() - batasKembali.getTime();
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                    let newStatus = item.status;
                    let newDenda = item.denda || 0;

                    if (diffDays > 0 && diffDays <= 10) {
                        newStatus = "terlambat";
                        newDenda = diffDays * 1000;
                    } else if (diffDays > 10) {
                        newStatus = "hilang";
                        newDenda = Number(item.book_price);
                    }

                    const shouldUpdate = newStatus !== item.status || newDenda !== item.denda;

                    if (shouldUpdate) {
                        const docRef = doc(db, "borrowings", item.key);
                        await updateDoc(docRef, {
                            status: newStatus,
                            denda: newDenda,
                        });

                        if (item.email && item.user_name) {
                            try {
                                if (newStatus === "terlambat") {
                                    await axios.post("/api/send-email", {
                                        to: item.email,
                                        subject: "Peringatan Buku Terlambat",
                                        text: `Halo ${item.user_name}, buku yang Anda pinjam "${item.book_title}" sudah terlambat dikembalikan. Anda akan dikenakan denda sebesar Rp. 1.000 per hari. Segera kembalikan sebelum dianggap hilang.`,
                                    });
                                } else if (newStatus === "hilang") {
                                    await axios.post("/api/send-email", {
                                        to: item.email,
                                        subject: "Pemberitahuan Buku Hilang",
                                        text: `Halo ${item.user_name}, buku yang Anda pinjam "${item.book_title}" telah dianggap hilang karena keterlambatan lebih dari 10 hari. Anda diwajibkan mengganti buku tersebut sebesar Rp. ${item.book_price.toLocaleString('id-ID')}. Harap segera menghubungi petugas perpustakaan untuk penyelesaian.`,
                                    });
                                }
                            } catch (emailError) {
                                console.error("Gagal kirim email:", emailError);
                            }
                        }

                        return { ...item, status: newStatus, denda: newDenda };
                    }
                }

                return item;
            })
        );

        return updated;
    };


    const fetchData = async () => {
        const querySnapshot = await getDocs(collection(db, "borrowings"));
        const data = querySnapshot.docs.map((doc) => ({
            key: doc.id,
            ...doc.data(),
        })) as Borrowing[];

        const updatedData = await updateBorrowingStatuses(data);
        setBorrowings(updatedData);
        setFilteredBorrowings(updatedData);
    };
    useEffect(() => {
        fetchData();
    }, []);


    const openModalEdit = (item: any) => {
        console.log('modal dong', item);
        setBorrowingId(item.key);
        onOpen()
    }

    const openModalDelete = (item: any) => {
        console.log('modal dong', item);
        setBorrowingId(item.key);
        onWarningOpen()
    }

    const dataTipe = [
        { key: 'dipinjam', label: 'Dipinjam', value: 'dipinjam' },
        { key: 'belum diambil', label: 'Belum diambil', value: 'belum diambil' },
        { key: 'dikembalikan', label: 'Dikembalikan', value: 'dikembalikan' },
        { key: 'terlambat', label: 'Terlambat', value: 'terlambat' },
        { key: 'hilang', label: 'Hilang', value: 'hilang' },
    ];

    const onSelectionChange = (item: string) => {
        console.log('item', item);
        setForm({
            ...form,
            status: item
        });
    };

    const handleUpdate = async () => {
        if (!form.status) {
            toast.error("Status tidak boleh kosong");
            return;
        }

        const borrowingRef = doc(db, "borrowings", borrowingId);
        const docSnap = await getDoc(borrowingRef);

        if (!docSnap.exists()) {
            toast.error("Dokumen tidak ditemukan");
            return;
        }

        try {
            const updates: any = { status: form.status };

            // Jika status diubah menjadi "dipinjam", tambahkan tanggal_kembali 7 hari dari hari ini
            if (form.status === "dipinjam") {
                const today = new Date();
                const returnDate = new Date(today);
                returnDate.setDate(today.getDate() + 8);

                updates.tanggal_kembali = returnDate;
            }

            await updateDoc(borrowingRef, updates);
            toast.success("Status berhasil diperbarui!");
            fetchData();
            onClose();
            setForm({ status: '' });
        } catch (error) {
            console.error("Gagal memperbarui status:", error);
            toast.error("Gagal memperbarui status");
        }
    };


    const handleDelete = async () => {
        try {
            const borrowingRef = doc(db, "borrowings", borrowingId);

            await deleteDoc(borrowingRef);

            toast.success("Data berhasil dihapus");

            // Opsional: Refresh data setelah delete
            fetchData(); // atau update state langsung
            onWarningClose()
        } catch (error) {
            console.error("Gagal menghapus data:", error);
            toast.error("Gagal menghapus data");
        }
    };

    const handleWhatsApp = (phone: string) => {
        if (!phone) {
            toast.error("Nomor telepon tidak tersedia");
            return;
        }

        // Hapus karakter non-digit, pastikan format internasional (62xxx)
        const cleanedPhone = phone.replace(/\D/g, '');

        // Redirect ke WhatsApp Web
        const waUrl = `https://wa.me/${cleanedPhone}`;

        window.open(waUrl, '_blank');
    };


    console.log('result', borrowings);

    return (
        <DefaultLayout>
            <div className="mt-5 mb-4">
                <h1 className="text-xl font-bold text-primaryGreen italic mb-4">
                    Riwayat Peminjaman
                </h1>

                {/* Filter Controls */}
                <div className="flex flex-col gap-4 mb-4">
                    <div className="w-full">
                        <Input
                            label="Cari Nama Siswa"
                            size='sm'
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                        />
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((option) => (
                            <Button
                                key={option.value}
                                size="sm"
                                variant="flat" // agar warna bisa di-overwrite
                                className={`capitalize ${statusFilter === option.value
                                    ? 'bg-primaryGreen text-white'
                                    : 'bg-gray-200 text-primaryGreen'
                                    }`}
                                onClick={() => setStatusFilter(option.value)}
                            >
                                {option.label}
                            </Button>

                        ))}
                    </div>
                </div>

                {/* Tabel Peminjaman */}
                <Table isCompact aria-label="Tabel Riwayat Peminjaman" classNames={{
                    th: "bg-secondaryGreen text-white",
                }}>
                    <TableHeader columns={columns}>
                        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                    </TableHeader>
                    <TableBody items={currentItems}>
                        {(item) => (
                            <TableRow key={item.key}>
                                {(columnKey) =>
                                    columnKey === 'actions' ? (
                                        <TableCell>
                                            <div className="flex gap-2 justify-items-center items-center">
                                                <button className='p-2 rounded-full bg-blue-600' onClick={() => openModalEdit(item)} ><BiEditAlt color='white' /></button>
                                                <button className='p-2 rounded-full bg-red-700' onClick={() => openModalDelete(item)} ><FaTrash color='white' /></button>
                                                <IoLogoWhatsapp onClick={() => handleWhatsApp(item.phone)} className='cursor-pointer' color='green' size={28} />
                                            </div>
                                        </TableCell>
                                    ) : columnKey === 'denda' ? (
                                        <TableCell>
                                            <p>
                                                {formatRupiah(getKeyValue(item, columnKey))}
                                            </p>
                                        </TableCell>
                                    ) : (
                                        <TableCell>
                                            {['tanggal_pinjam', 'tanggal_kembali'].includes(columnKey as string)
                                                ? formatDate(getKeyValue(item, columnKey))
                                                : getKeyValue(item, columnKey)}
                                        </TableCell>
                                    )
                                }
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {filteredBorrowings.length > itemsPerPage && (
                    <div className="flex justify-center mt-4">
                        <Pagination
                            total={totalPages}
                            initialPage={currentPage}
                            onChange={setCurrentPage}
                            showControls
                            showShadow
                        />
                    </div>
                )}
            </div>


            <ModalDefault isOpen={isOpen} onClose={onClose} >
                <h1 className='text-xl font-medium'>Edit Peminjaman</h1>
                <Autocomplete
                    placeholder="Pilih Status Peminjaman"
                    className="w-full"
                    onSelectionChange={(e: any) => onSelectionChange(e)}
                    value={form.status}
                >
                    {dataTipe.map((item) => (
                        <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
                    ))}
                </Autocomplete>
                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl ' onClick={onClose} >Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-4 rounded-xl' onClick={handleUpdate} >Ya</ButtonPrimary>
                </div>
            </ModalDefault>

            <ModalAlert isOpen={isWarningOpen} onClose={onWarningClose} >
                <h1 className='text-xl font-medium' >Apakah anda yakin akan menghapus riwayat user ini ?</h1>
                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl ' onClick={onWarningClose} >Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-2 rounded-xl' onClick={handleDelete}>Hapus</ButtonPrimary>
                </div>
            </ModalAlert>
        </DefaultLayout>
    );
};

export default page;