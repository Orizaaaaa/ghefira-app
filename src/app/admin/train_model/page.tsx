'use client'
import ButtonSecondary from '@/components/elements/buttonSecondary'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import React from 'react'
import { FaInfoCircle } from 'react-icons/fa'
import { FaBrain } from 'react-icons/fa6'
import { MdRestartAlt } from 'react-icons/md'

type Props = {}

const page = (props: Props) => {
    return (
        <DefaultLayout>
            <div className="flex justify-end mb-4 gap-3">
                <ButtonSecondary className="py-2 px-4 rounded-lg flex items-center gap-2">
                    <FaBrain />
                    Latih model
                </ButtonSecondary>
                <ButtonSecondary className="py-2 px-4 rounded-lg flex items-center gap-2">
                    <MdRestartAlt />
                    Reset model
                </ButtonSecondary>
                <ButtonSecondary className="py-2 px-4 rounded-lg flex items-center gap-2">
                    <FaInfoCircle />
                    Status Model
                </ButtonSecondary>
            </div>
        </DefaultLayout>

    )
}

export default page