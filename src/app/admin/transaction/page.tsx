import ButtonSecondary from '@/components/elements/buttonSecondary'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import React from 'react'

type Props = {}

const page = (props: Props) => {
    return (
        <DefaultLayout>
            <div className=" flex justify-end mb-4">
                <ButtonSecondary className='py-1 px-2 rounded-xl'> + Tambah Transaksi </ButtonSecondary>
            </div>
        </DefaultLayout>
    )
}

export default page