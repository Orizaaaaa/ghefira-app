'use client'
import { createBook, deleteBook, getAllBooks, postImage, updateBook } from '@/api/method'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useDisclosure } from '@heroui/react'
import { title } from 'process'
import React, { useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { FaTrash } from 'react-icons/fa6'
import { IoMdTrash } from 'react-icons/io'
import { IoCameraOutline } from 'react-icons/io5'
import { RiEdit2Fill } from 'react-icons/ri'

type Props = {}

const page = (props: Props) => {
    const [idBook, setIdBook] = React.useState('');
    const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure();
    const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
    const { onOpen, onClose, isOpen } = useDisclosure();
    const [data, setData]: any = React.useState([])
    const [form, setForm] = React.useState({
        image: null as File | null,
        title: '',
        author: '',
        stock: 0,
        rak: '',
        price: 0,
    })

    const [formUpdate, setFormUpdate] = React.useState({
        image: null as File | any,
        title: '',
        author: '',
        stock: 0,
        stock_available: 0,
        rak: '',
        price: 0,
    })

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };
    const handleChangeUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormUpdate({ ...formUpdate, [name]: value });
    };


    //input gambar
    const handleFileManager = (fileName: string) => {
        const inputId = fileName === 'add' ? "image-input-add" : fileName === 'update' ? "image-input-update" : null;

        if (inputId) {
            const fileInput = document.getElementById(inputId) as HTMLInputElement | null;
            fileInput?.click();
        } else {
            console.log('error');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, InputSelect: string) => {
        if (InputSelect === 'add') {
            const selectedImage = e.target.files?.[0];
            setForm({ ...form, image: selectedImage || null });
        } else if (InputSelect === 'update') {
            const selectedImage = e.target.files?.[0];
            setFormUpdate({ ...formUpdate, image: selectedImage || null });
        }
        else {
            console.log('error');
        }
    };

    console.log(form);





    const openModalDelete = (docId: string) => {
        onWarningOpen();
        setIdBook(docId);
    }

    const onOpenModalUpdate = (item: any) => {
        onUpdateOpen();
        setFormUpdate(item);
        setIdBook(item.id);
    }

    const handleDelete = async () => {
        try {
            // Tampilkan toast loading saat proses delete
            const toastId = toast.loading('Menghapus buku...');
            // Panggil fungsi deleteBook
            await deleteBook(idBook);
            fetchBooks();
            onWarningClose();
            toast.success('Buku berhasil dihapus', { id: toastId });

        } catch (err) {
            console.error('Gagal menghapus buku:', err);
            toast.error('Gagal menghapus buku!');
        }
    }

    const handleSubmit = async () => {
        try {
            // Validasi input
            if (
                !form.title.trim() ||
                !form.author.trim() ||
                !form.rak.trim() ||
                !form.image ||
                form.stock <= 0 ||
                form.price <= 0
            ) {
                toast.error('Semua data wajib diisi!');
                return;
            }

            const toastId = toast.loading('Mengunggah buku baru...');

            let imageUrl = '';

            // Upload image ke Cloudinary
            imageUrl = await postImage({ image: form.image });
            if (!imageUrl) throw new Error('Gagal upload gambar');

            const newBook = {
                title: form.title,
                author: form.author,
                stock: form.stock,
                stock_available: form.stock, // initial stock available = stock penuh
                rak: form.rak,
                price: form.price,
                image: imageUrl,
                createdAt: new Date(),
            };

            const bookId = await createBook(newBook);
            console.log('Book berhasil disimpan dengan ID:', bookId);
            onClose();
            setForm({
                image: null,
                title: '',
                author: '',
                stock: 0,
                rak: '',
                price: 0,
            });
            fetchBooks();
            toast.success('Selesai menambah list buku baru', { id: toastId });

        } catch (err) {
            console.error('Gagal submit form:', err);
            toast.error('Gagal menambah buku!');
        }
    };

    const handleUpdate = async () => {
        try {
            // Validasi input
            if (
                !formUpdate.title.trim() ||
                !formUpdate.author.trim() ||
                !formUpdate.rak.trim() ||
                !formUpdate.image ||
                formUpdate.stock <= 0 ||
                formUpdate.price <= 0
            ) {
                toast.error('Semua data wajib diisi!');
                return;
            }

            const toastId = toast.loading('Mengunggah perubahan buku...');

            let imageUrl = formUpdate.image;

            if (typeof formUpdate.image !== 'string') {
                imageUrl = await postImage({ image: formUpdate.image });
                if (!imageUrl) throw new Error('Gagal upload gambar');
            }

            const updatedBook = {
                title: formUpdate.title,
                author: formUpdate.author,
                stock: formUpdate.stock,
                rak: formUpdate.rak,
                price: formUpdate.price,
                image: imageUrl,
                updatedAt: new Date(),
            };

            await updateBook(idBook, updatedBook);

            onUpdateClose();
            fetchBooks();
            toast.success('Buku berhasil diperbarui', { id: toastId });

        } catch (err) {
            console.error('Gagal update buku:', err);
            toast.error('Gagal memperbarui buku!');
        }
    };


    console.log(data);
    console.log('ini adalah data form update', formUpdate);


    return (
        <DefaultLayout>
            <div className="flex items-center justify-between">
                <h1 className='text-xl font-bold text-primaryGreen italic mb-2' >Semua List Buku</h1>
                <ButtonSecondary className='py-2 px-3 rounded-xl' onClick={onOpen} >Tambah Buku</ButtonSecondary>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {data.map((item: any) => (
                    <div key={item.id} className="shadow-xl rounded-lg flex flex-col h-full">
                        <div className="flex justify-center items-center">
                            <img className="rounded-t-lg h-40 w-full object-cover" src={item.image} alt="" />
                        </div>
                        <div className="p-2 flex flex-col justify-between flex-grow">
                            <div>
                                <p className="text-[11px] mt-2 text-gray-400">{item.author}</p>
                                <h1 className="text-[11px] font-medium">{item.title}</h1>
                                <h1 className="text-[11px]">Total Stock {item.stock}</h1>
                                <h1 className="text-[11px]">Stock Tersedia {item.stock_available || 'kosong'}</h1>
                                <h1 className="text-[11px] text-gray-400">Rak nomor {item.rak}</h1>
                            </div>

                            <div className="flex justify-end gap-2 ">
                                <RiEdit2Fill
                                    onClick={() => onOpenModalUpdate(item)}
                                    className="cursor-pointer"
                                    size={20}
                                    color="#3E5F44"
                                />
                                <IoMdTrash
                                    onClick={() => openModalDelete(item.id)}
                                    className="cursor-pointer"
                                    size={20}
                                    color="red"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            <ModalDefault isOpen={isUpdateOpen} onClose={onUpdateClose}>

                <h1 className='text-xl font-medium mb-4' >Edit Buku</h1>
                <div className="images">

                    {formUpdate.image && formUpdate.image instanceof Blob ? (
                        <img
                            className="h-[20px] md:h-[100px] w-[70px] mx-auto rounded-md object-cover"
                            src={URL.createObjectURL(formUpdate.image)}
                        />
                    ) : (
                        <img
                            className="h-[20px] md:h-[100px] w-[70px] mx-auto rounded-md object-cover"
                            src={formUpdate.image}
                        />
                    )}


                    <input
                        type="file"
                        className="hidden"
                        id="image-input-update"
                        onChange={(e) => handleImageChange(e, 'update')}
                    />

                    <div className="flex justify-center items-center gap-3 my-3">
                        <button className={`border-2 text-sm border-primaryGreen
                             text-primaryGreen px-2 py-1 rounded-md 
                             ${formUpdate.image === null ? 'hidden' : ''}`}
                            type="button" onClick={() => handleFileManager('update')}>
                            Ubah Gambar
                        </button>
                    </div>
                </div>
                <InputForm
                    className="bg-green-700/30"
                    type="text"
                    value={formUpdate.title}
                    marginDiown='mb-0'
                    htmlFor="title"
                    title="Judul Buku"
                    placeholder="Masukan Judul Buku"
                    onChange={handleChangeUpdate}
                />

                <InputForm
                    className="bg-green-700/30"
                    type="text"
                    value={formUpdate.author}
                    marginDiown='mb-0'
                    htmlFor="author"
                    title="Penulis Buku"
                    placeholder="Masukan Penulis Buku"
                    onChange={handleChangeUpdate}
                />

                <div className="flex gap-5">
                    <InputForm
                        className="bg-green-700/30"
                        type="number"
                        value={formUpdate.stock}
                        marginDiown='mb-0'
                        htmlFor="stock"
                        title="Stok Buku"
                        placeholder="Masukan Jumlah Stok"
                        onChange={handleChangeUpdate}
                    />

                    <InputForm
                        className="bg-green-700/30"
                        type="text"
                        value={formUpdate.price}
                        marginDiown='mb-0'
                        htmlFor="price"
                        title="Harga Buku"
                        placeholder="Masukan Harga Buku"
                        onChange={handleChangeUpdate}
                    />

                </div>

                <InputForm
                    className="bg-green-700/30"
                    type="text"
                    value={formUpdate.rak}
                    marginDiown='mb-0'
                    htmlFor="rak"
                    title="Lokasi Rak"
                    placeholder="Masukan Lokasi Rak"
                    onChange={handleChangeUpdate}
                />



                <div className="flex justify-end">
                    <div className="flex">
                        <ButtonSecondary className='py-2 px-3 rounded-xl mr-2' onClick={onUpdateClose}  >Batal</ButtonSecondary>
                        <ButtonPrimary className='py-2 px-3 rounded-xl' onClick={handleUpdate} >Edit Buku</ButtonPrimary>
                    </div>
                </div>

            </ModalDefault>

            <ModalDefault isOpen={isOpen} onClose={onClose} >
                <h1 className='text-xl font-medium mb-4' >Tambah Buku</h1>
                <div className="images">

                    {form.image && form.image instanceof Blob ? (
                        <img
                            className="h-[20px] md:h-[100px] w-[70px] mx-auto rounded-md object-cover"
                            src={URL.createObjectURL(form.image)}
                        />
                    ) : (
                        <div className="images rounded-md h-[50px] bg-gray-300 flex justify-center items-center">
                            <button
                                className="flex justify-center items-center h-full w-full"
                                type="button"
                                onClick={() => handleFileManager('add')}
                            >
                                <IoCameraOutline className="text-2xl" />
                            </button>
                        </div>
                    )}


                    <input
                        type="file"
                        className="hidden"
                        id="image-input-add"
                        onChange={(e) => handleImageChange(e, 'add')}
                    />

                    <div className="flex justify-center items-center gap-3 my-3">
                        <button className={`border-2 text-sm border-primaryGreen text-primaryGreen px-2 py-1 rounded-md ${form.image === null ? 'hidden' : ''}`} type="button" onClick={() => handleFileManager('add')}>
                            Ubah Gambar
                        </button>
                    </div>
                </div>
                <InputForm
                    className="bg-green-700/30"
                    type="text"
                    value={form.title}
                    marginDiown='mb-0'
                    htmlFor="title"
                    title="Judul Buku"
                    placeholder="Masukan Judul Buku"
                    onChange={handleChange}
                />

                <InputForm
                    className="bg-green-700/30"
                    type="text"
                    value={form.author}
                    marginDiown='mb-0'
                    htmlFor="author"
                    title="Penulis Buku"
                    placeholder="Masukan Penulis Buku"
                    onChange={handleChange}
                />

                <div className="flex gap-5">
                    <InputForm
                        className="bg-green-700/30"
                        type="number"
                        value={form.stock}
                        marginDiown='mb-0'
                        htmlFor="stock"
                        title="Stok Buku"
                        placeholder="Masukan Jumlah Stok"
                        onChange={handleChange}
                    />

                    <InputForm
                        className="bg-green-700/30"
                        type="text"
                        value={form.price}
                        marginDiown='mb-0'
                        htmlFor="price"
                        title="Harga Buku"
                        placeholder="Masukan Harga Buku"
                        onChange={handleChange}
                    />

                </div>

                <InputForm
                    className="bg-green-700/30"
                    type="text"
                    value={form.rak}
                    marginDiown='mb-0'
                    htmlFor="rak"
                    title="Lokasi Rak"
                    placeholder="Masukan Lokasi Rak"
                    onChange={handleChange}
                />



                <div className="flex justify-end">
                    <div className="flex">
                        <ButtonSecondary className='py-2 px-3 rounded-xl mr-2' onClick={onClose} >Batal</ButtonSecondary>
                        <ButtonPrimary className='py-2 px-3 rounded-xl' onClick={handleSubmit} >Tambah</ButtonPrimary>
                    </div>
                </div>
            </ModalDefault>

            <ModalAlert isOpen={isWarningOpen} onClose={onWarningClose} >
                <h1>Apakah anda yakin akan menghapus buku ini ?</h1>
                <div className="flex justify-end gap-2">
                    <ButtonSecondary className='py-1 px-2 rounded-xl ' onClick={onWarningClose} >Batal</ButtonSecondary>
                    <ButtonPrimary className='py-1 px-2 rounded-xl' onClick={handleDelete}  >Hapus</ButtonPrimary>
                </div>
            </ModalAlert>
        </DefaultLayout>
    )
}

export default page