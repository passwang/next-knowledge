'use client';
import { Suspense, useState } from 'react';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
export default function SearchComponent({ initialLinks }: { initialLinks: Links[] }) {
  const [links, setLinks] = useState<Links[]>(initialLinks);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query.trim());
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      setIsLoading(true);
      const response = await fetch(`/api/search?query=${searchQuery}`);
      const data = await response.json();
      setLinks(data);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4">
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
      </div>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
      {/* <Suspense fallback={<div className="mt-2 text-blue-500">加载中...</div>}> */}
      {/* 这里suspense加载异步组件 对当前没用 */}
      {isLoading ? (
          <div className="mt-2 text-blue-500">加载中2...</div>
        ) : ( <NavLinks links={links} />)}
        {/* </Suspense> */}
      </div>
    </>
  );
}