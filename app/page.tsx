import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';
export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6 bg-gray-50 justify-center">
      <div className=" flex grow flex-col justify-center  md:flex-row">
        <div className="flex flex-col justify-center items-center rounded-lg bg-gray-50 px-6 py-10 ">
   
          <div className={`${lusitana.className} text-xl text-gray-800 md:text-3xl md:leading-normal  p-6 `}>
            <h1>欢迎来到我的知识库!</h1> </div>
          <Link
            href="/login"
            className="flex justify-center items-center gap-5  rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
          >
            <span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />
          </Link>
        </div>
      </div>
    </main>
  );
}
