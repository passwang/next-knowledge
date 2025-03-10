import AcmeLogo from '@/app/ui/acme-logo';
import LoginForm from '@/app/ui/login-form';
import { Suspense } from 'react';
import { lusitana } from '@/app/ui/fonts';
export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full justify-center items-center rounded-lg bg-blue-500 p-3 md:h-36">
          {/* <div className="w-32 text-white md:w-36">
            <AcmeLogo />
          </div> */}
          <div className={`${lusitana.className} w-42 text-white md:w-46 text-lg`}>
          登录知识库
          </div>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}