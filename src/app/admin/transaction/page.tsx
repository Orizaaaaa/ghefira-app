'use client'
import ButtonPrimary from '@/components/elements/buttonPrimary'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useDisclosure } from '@heroui/react'
import React, { useState } from 'react'

type Props = {}

const page = (props: Props) => {
    const [id, setId] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenUpdate, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure();
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();
    const [form, setForm] = useState({
        user: '',
        saldo: '',
        amount: '',
        description: '',
        type: '', // atau bisa default ke 'income' kalau dibutuhkan
    });

    const [formUpdate, setFormUpdate] = useState({
        user: '',
        saldo: '',
        amount: '',
        description: '',
        type: '', // atau bisa default ke 'income' kalau dibutuhkan
    })

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

    return (
        <DefaultLayout>
            <div className=" flex justify-end mb-4 gap-3">
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={handleOpenCreate}> + Tambah Transaksi </ButtonSecondary>
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={handleOpenUpdate}> + Edit </ButtonSecondary>
                <ButtonSecondary className='py-1 px-2 rounded-xl' onClick={handleOpenDelete}> delete </ButtonSecondary>
            </div>

            <ModalDefault isOpen={isOpen} onClose={onClose}>
                {/* User */}
                <InputForm
                    htmlFor="user"
                    title="User ID"
                    type="text"
                    className="bg-slate-300 rounded-md mt-3"
                    onChange={handleChange}
                    value={form.user}
                />

                {/* Saldo */}
                <InputForm
                    htmlFor="saldo"
                    title="Saldo ID"
                    type="text"
                    className="bg-slate-300 rounded-md"
                    onChange={handleChange}
                    value={form.saldo}
                />

                {/* Amount */}
                <InputForm
                    htmlFor="amount"
                    title="Amount"
                    type="number"
                    className="bg-slate-300 rounded-md"
                    onChange={handleChange}
                    value={form.amount}
                />

                {/* Description */}
                <InputForm
                    htmlFor="description"
                    title="Description"
                    type="text"
                    className="bg-slate-300 rounded-md"
                    onChange={handleChange}
                    value={form.description}
                />

                {/* Type */}
                <div className="mt-3">
                    <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                    <select
                        id="type"
                        name="type"
                        className="w-full bg-slate-300 rounded-md p-2 mt-1"
                        value={form.type}
                    >
                        <option value="">Pilih Tipe</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

                {/* Buttons */}
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
                {/* User */}
                <InputForm
                    htmlFor="user"
                    title="User ID"
                    type="text"
                    className="bg-slate-300 rounded-md mt-3"
                    onChange={handleChangeUpdate}
                    value={formUpdate.user}
                />

                {/* Saldo */}
                <InputForm
                    htmlFor="saldo"
                    title="Saldo ID"
                    type="text"

                    className="bg-slate-300 rounded-md"
                    onChange={handleChangeUpdate}
                    value={formUpdate.saldo}
                />

                {/* Amount */}
                <InputForm
                    htmlFor="amount"
                    title="Amount"
                    type="number"
                    className="bg-slate-300 rounded-md"
                    onChange={handleChangeUpdate}
                    value={formUpdate.amount}
                />

                {/* Description */}
                <InputForm
                    htmlFor="description"
                    title="Description"
                    type="text"
                    className="bg-slate-300 rounded-md"
                    onChange={handleChangeUpdate}
                    value={formUpdate.description}
                />

                {/* Type */}
                <div className="mt-3">
                    <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                    <select
                        id="type"
                        name="type"
                        className="w-full bg-slate-300 rounded-md p-2 mt-1"
                        value={formUpdate.type}
                    >
                        <option value="">Pilih Tipe</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

                {/* Tombol Aksi */}
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

export default page