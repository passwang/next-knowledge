'use client';
import {
  UserGroupIcon,
  HomeIcon,
  InboxIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useState } from 'react';
import { type } from 'os';

type Topic = {
  topic_name: string;
  content: string;
  topic_id: string;
}[];
type TopicData = {
  cate: string;
  cate_name: string;
  topics: Topic[];
  topic_count: string;
}[];
export default function NavLinks(props:{links: TopicData}) {
  const {links} = props;
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <nav className="flex-1 p-4 rounded-md bg-gray-50">
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.cate}>
            <div
              className={clsx('flex relative h-[48px] cursor-pointer grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',  {
                'bg-sky-100 text-blue-600': pathname === link.cate,
              },)}
              onClick={() => link.topics && toggleDropdown(link.cate)}
            >
               {/* <link.icon className="w-6" /> */}
              <p className="hidden md:block">{link.cate_name}</p>
              {link.topics && (openDropdown === link.cate ? (
                <ChevronUpIcon className='w-4 absolute right-0 top-4'></ChevronUpIcon>
              ): (
                <ChevronDownIcon className='w-4 absolute right-0 top-4'></ChevronDownIcon>
              ))}
            </div>
            {link.topics && openDropdown === link.cate && (
              <ul className="pl-4">
                {link.topics.map((v: any) => (
                  <li key={v.id}>
                    <Link
                      href={`/dashboard/${link.cate}/${v.id}`}
                      className={clsx('flex h-[48px] cursor-pointer grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',  {
                        'bg-sky-100 text-blue-600': pathname === link.cate,
                      },)}
                    >
                      {v.topic_name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}