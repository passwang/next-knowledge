import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { MagnifyingGlassIcon, PowerIcon } from '@heroicons/react/24/outline';

import { handleSignOut } from '@/app/lib/actions';
import SearchComponent from './search';
import { fetchTopic } from '@/app/lib/knowledge';
type Link = {
  topic_name: string;
  content: string;
  topic_id: string;
}[];
type Links = {
  cate: string;
  cate_name: string;
  topics: Link[];
  topic_count: string;
}[];
export default async function SideNav() {
  const initialLinks: Links[] = await fetchTopic(); 
  return (
    <div className="flex h-full flex-col px-3 py-6 md:px-2 ">
      {/* 搜索 */}
      <SearchComponent initialLinks={initialLinks} />
      {/* <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索...回车"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div> */}
      {/* <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2"> */}
        {/* <NavLinks links={links}/> */}
        <form action={handleSignOut}>
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      {/* </div> */}
    </div>
  );
}
