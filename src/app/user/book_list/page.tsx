'use client'

import { getAllBooks } from '@/api/method'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import ModalDefault from '@/components/fragments/modal/modal'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { db } from '@/lib/firebase/firebaseConfig'
import { truncateText } from '@/utils/helper'
import { useDisclosure } from '@heroui/react'
import { addDoc, collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { IoSearch } from 'react-icons/io5'

type Props = {}

const Page = (props: Props) => {
    const { onOpen, onClose, isOpen } = useDisclosure();
    const [form, setForm] = React.useState({
        email: '',
        phone: '',
        user_uid: '',                // ID user yang meminjam
        user_name: '',              // nama user
        book_id: '',                // ID buku
        book_title: '',             // Judul buku
        book_price: 0,              // Harga buku (untuk kasus hilang)
        jumlah: 1,                  // Berapa banyak buku dipinjam
        tanggal_pinjam: new Date(),// Tanggal pinjam
        tanggal_kembali: null,     // Tanggal pengembalian (diisi nanti)
        status: 'belum diambil',    // default status
    });
    const [data, setData]: any = React.useState([])
    const [searchTerm, setSearchTerm] = React.useState('')

    const fetchBooks = async () => {
        try {
            const books = await getAllBooks()
            setData(books)
        } catch (err) {
            console.error('Gagal mengambil data buku:', err)
        }
    }

    useEffect(() => {
        fetchBooks()
    }, [])

    const filteredData = data.filter((item: any) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handlePinjam = async () => {
        try {
            const bookRef = doc(db, 'books', form.book_id);
            const bookSnap = await getDoc(bookRef);

            if (!bookSnap.exists()) {
                toast.error('Buku tidak ditemukan');
                return;
            }

            const bookData = bookSnap.data();
            const stockAvailable = bookData.stock_available;

            if (form.jumlah > stockAvailable) {
                toast.error('Stok tidak mencukupi');
                return;
            }

            // Cek apakah user masih memiliki pinjaman buku yang sama dengan status belum dikembalikan
            const q = query(
                collection(db, 'borrowings'),
                where('user_id', '==', form.user_uid),
                where('book_id', '==', form.book_id),
                where('status', 'in', ['belum diambil', 'dipinjam', 'terlambat', 'hilang'])
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                toast.error('Anda masih memiliki buku ini yang belum dikembalikan!');
                return;
            }

            const tanggalPinjam = new Date();

            const newBorrowing = {
                email: form.email,
                phone: form.phone,
                user_id: form.user_uid,
                user_name: form.user_name,
                book_id: form.book_id,
                book_title: form.book_title,
                book_price: form.book_price,
                jumlah: form.jumlah,
                tanggal_pinjam: Timestamp.fromDate(tanggalPinjam),
                tanggal_kembali: null,
                status: 'belum diambil',
                denda: 0,
            };

            await addDoc(collection(db, 'borrowings'), newBorrowing);

            await updateDoc(bookRef, {
                stock_available: stockAvailable - form.jumlah,
            });

            toast.success('Berhasil, anda tinggal datang dan konfirmasi ke admin perpus');
            onClose();
        } catch (error) {
            console.error('Gagal memproses peminjaman:', error);
            toast.error('Gagal meminjam buku');
        }
    };


    const handleModalBorrow = (item: any) => {
        const storedUser: any = localStorage.getItem('user');
        const parsedUser = JSON.parse(storedUser);
        setForm((prevForm) => ({
            ...prevForm,
            email: parsedUser.email || '',
            phone: parsedUser.phone,
            user_uid: parsedUser.uid || '',
            user_name: parsedUser.name || '',
            book_id: item.id,                // ID buku
            book_title: item.title,             // Judul buku
            book_price: item.price,
        }));
        onOpen()
    }

    return (
        <DefaultLayout>
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-primaryGreen italic mb-2">
                    Semua List Buku
                </h1>
            </div>

            <div className="flex w-full px-3 py-2 items-center gap-3 rounded-lg mt-4 border-2 border-primaryGreen">
                <IoSearch color="#3E5F44" size={20} />
                <input
                    placeholder="SEARCH"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full placeholder-gray-500 border-none focus:outline-none focus:ring-0"
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {filteredData.map((item: any) => (
                    <div
                        className="shadow-xl rounded-lg flex flex-col h-full"
                        key={item.id}
                    >
                        <div className="flex justify-center items-center">
                            <img
                                className="rounded-t-lg h-40 w-full object-cover"
                                src={item.image}
                                alt={item.title}
                            />
                        </div>
                        <div className="p-2 flex flex-col flex-grow cursor-pointer"
                            onClick={() => handleModalBorrow(item)}>
                            <div className="mb-2">
                                <p className="text-[11px] text-gray-400 line-clamp-1">
                                    {item.author}
                                </p>
                                <h1 className="text-[11px] font-semibold line-clamp-2">
                                    {truncateText(item.title, 38)}
                                </h1>
                            </div>
                            <div className="mt-auto">
                                <h1 className="text-[11px]">
                                    Stok Tersedia {item.stock_available}
                                </h1>
                                <h1 className="text-[11px] text-gray-400">
                                    Rak nomor {item.rak}
                                </h1>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ModalDefault isOpen={isOpen} onClose={onClose}>
                <h1 className='text-xl font-bold text-primaryGreen italic mb-2' >Pinjam Buku</h1>
                <h1>Apakah anda yakin akan meminjam buku ini ?</h1>
                <div className="flex justify-end items-center gap-3">
                    <button className='bg-primaryGreen text-white py-2 px-4 rounded-lg cursor-pointer'
                        onClick={handlePinjam} >Ya</button>
                    <button className='bg-secondaryGreen text-white py-2 px-4 rounded-lg cursor-pointer' onClick={onClose} >Tidak</button>
                </div>
            </ModalDefault>
        </DefaultLayout>
    )
}

export default Page
