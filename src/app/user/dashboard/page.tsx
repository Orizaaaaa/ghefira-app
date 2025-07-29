'use client'
import { getAllBooks } from '@/api/method'
import { mann_above } from '@/app/image'
import ModalDefault from '@/components/fragments/modal/modal'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { db } from '@/lib/firebase/firebaseConfig'
import { formatRupiah, truncateText } from '@/utils/helper'
import { useDisclosure } from '@heroui/react'
import { addDoc, collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaBookReader } from 'react-icons/fa'
import { FaBook } from 'react-icons/fa6'
import { IoPeople } from 'react-icons/io5'
import { TbMoneybag } from 'react-icons/tb'
import { Swiper, SwiperSlide } from 'swiper/react'

type Props = {}

const page = (props: Props) => {
    const { onOpen, onClose, isOpen } = useDisclosure();
    const [jumlahBukuDipinjam, setJumlahBukuDipinjam] = useState(0);
    const [jumlahSemuaBuku, setJumlahSemuaBuku] = useState(0);
    const [totalDendaUser, setTotalDendaUser] = useState(0);
    const [data, setData]: any = React.useState([])
    const router = useRouter();
    const fetchBooks = async () => {
        try {
            const books = await getAllBooks();
            setData(books);
        } catch (err) {
            console.error('Gagal mengambil data buku:', err);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);


    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                const storedUser: any = localStorage.getItem('user');
                const parsedUser = JSON.parse(storedUser);
                const userId = parsedUser.uid;

                // Ambil semua data buku
                const booksSnapshot = await getDocs(collection(db, 'books'));
                setJumlahSemuaBuku(booksSnapshot.size);

                // Ambil semua peminjaman user
                const borrowingsQuery = query(
                    collection(db, 'borrowings'),
                    where('user_id', '==', userId)
                );
                const borrowingsSnapshot = await getDocs(borrowingsQuery);

                let totalDenda = 0;
                let totalJumlahDipinjam = 0;

                borrowingsSnapshot.forEach((doc) => {
                    const data = doc.data();

                    if (['dipinjam', 'belum diambil'].includes(data.status)) {
                        totalJumlahDipinjam += data.jumlah || 0;
                    }

                    totalDenda += data.denda || 0;
                });

                setJumlahBukuDipinjam(totalJumlahDipinjam);
                setTotalDendaUser(totalDenda);
            } catch (error) {
                console.error('Gagal mengambil data statistik user:', error);
            }
        };

        fetchUserStats();
    }, []);

    const [form, setForm] = React.useState({
        email: '',
        user_uid: '',                // ID user yang meminjam
        user_name: '',              // nama user
        phone: '',
        book_id: '',                // ID buku
        book_title: '',             // Judul buku
        book_price: 0,              // Harga buku (untuk kasus hilang)
        jumlah: 1,                  // Berapa banyak buku dipinjam
        tanggal_pinjam: new Date(),// Tanggal pinjam
        tanggal_kembali: null,     // Tanggal pengembalian (diisi nanti)
        status: 'belum diambil',    // default status
    });


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


    console.log(form);

    return (
        <DefaultLayout>
            <div className="relative bg-primaryGreen w-full p-3 rounded-xl overflow-hidden">
                {/* Decorative Circles with background */}
                <div className="absolute -top-10 -left-10 w-32 h-32  bg-white/35 opacity-30 rounded-full z-0"></div>
                <div className="absolute top-1/2 left-10 w-16 h-16  bg-white/35 opacity-30 rounded-full z-0"></div>
                <div className="absolute bottom-0 right-5 w-24 h-24  bg-white/35 opacity-30 rounded-full z-0"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40  bg-white/35 opacity-20 rounded-full z-0"></div>

                {/* Main Content */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
                    <div className="flex justify-center items-center">
                        <div>
                            <h1 className="font-bold text-2xl text-white">Hai siswa, selamat datang 👋</h1>
                            <p className="text-sm text-white">Mari mulai membaca banyak buku di perpustakaan ini</p>
                        </div>
                    </div>

                    <div className="flex justify-center items-center order-1 lg:order-2">
                        <div className="h-40">
                            <Image className="w-full h-full" src={mann_above} alt="dashboard" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 my-5 gap-5">
                <div className='bg-primaryGreen rounded-xl p-2' >
                    <div className="flex gap-3 items-center">
                        <FaBookReader size={20} color='white' />
                        <h1 className='text-white' >Jumlah Buku Yang Di Pinjam </h1>

                    </div>
                    <h1 className='text-white text-3xl font-bold mt-3' >{jumlahBukuDipinjam}</h1>
                </div>
                <div className='bg-primaryGreen rounded-xl p-2' >
                    <div className="flex gap-3 items-center">
                        <FaBook size={20} color='white' />
                        <h1 className='text-white' >Jumlah Buku saat ini</h1>

                    </div>
                    <h1 className='text-white text-3xl font-bold mt-3' >{jumlahSemuaBuku}</h1>
                </div>

                <div className='bg-primaryGreen rounded-xl p-2' >
                    <div className="flex gap-3 items-center">
                        <TbMoneybag size={20} color='white' />
                        <h1 className='text-white' >Total Semua Denda</h1>
                    </div>
                    <h1 className='text-white text-3xl font-bold mt-3' >{formatRupiah(totalDendaUser)}</h1>
                </div>
            </div>

            <div className='grid-cols-6 mb-8' >
                <div className="flex justify-between items-center">
                    <h1 className='text-xl font-bold text-primaryGreen italic mb-2' >Buku Terbaru Saat Ini</h1>
                    <p className='text-secondaryGreen cursor-pointer' onClick={() => router.push('/user/book_list')} >Lihat Semua</p>
                </div>

                <div className="mt-4">
                    <Swiper
                        spaceBetween={16}
                        breakpoints={{
                            320: {
                                slidesPerView: 1,
                            },
                            480: {
                                slidesPerView: 2,
                            },
                            640: {
                                slidesPerView: 3,
                            },
                            768: {
                                slidesPerView: 4,
                            },
                            1024: {
                                slidesPerView: 5,
                            },
                        }}
                        pagination={{ clickable: true }}
                        navigation
                    >
                        {data.map((item: any) => (
                            <SwiperSlide key={item.id}>
                                <div className="shadow-xl rounded-lg flex flex-col h-[270px] my-3">
                                    <div className="flex justify-center items-center">
                                        <img
                                            className="rounded-t-lg h-40 w-full object-cover"
                                            src={item.image}
                                            alt={item.title}
                                        />
                                    </div>
                                    <div className="p-2 flex flex-col flex-grow cursor-pointer "
                                        onClick={() => handleModalBorrow(item)}>
                                        <div className="mb-2">
                                            <p className="text-[11px] text-gray-400">{truncateText(item.author, 17)}</p>
                                            <h1 className="text-[11px] font-medium line-clamp-2">{truncateText(item.title, 38)}</h1>
                                        </div>
                                        <div className="mt-auto">
                                            <h1 className="text-[11px]">Stok Tersedia {item.stock_available}</h1>
                                            <h1 className="text-[11px] text-gray-400">Rak nomor {item.rak}</h1>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
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
            </div>
        </DefaultLayout>
    )
}

export default page