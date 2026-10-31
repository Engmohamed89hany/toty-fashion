"use client";
import { FaUsers } from "react-icons/fa";
import type { IconType } from "react-icons";
import Link from "next/link";
import { GiClothes } from "react-icons/gi";
import { MdAddBox, MdCategory } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import { usePathname } from "next/navigation";
interface ILinks {
  name: string;
  href: string;
  icon: IconType;
}
const Links: ILinks[] = [
  {
    name: "اداره المستخدمين و العميلات",
    href: "/dashboard/users",
    icon: FaUsers,
  },
  {
    name: "اداره المنتجات و المخزون",
    href: "/dashboard/products",
    icon: GiClothes,
  },
  {
    name: "إضافة منتج جديد",
    href: "/dashboard/products/new",
    icon: MdAddBox,
  },
  {
    name: "إدارة التصنيفات",
    href: "/dashboard/categories",
    icon: MdCategory,
  },
  {
    name: "إضافة تصنيف جديد",
    href: "/dashboard/categories/new",
    icon: MdCategory,
  },
  {
    name: "إدارة التقييمات",
    href: "/dashboard/reviews",
    icon: FaStar,
  },
];

const isLinkActive = (href: string, path: string) => {
  if (path === href) {
    return true;
  }

  if (href === "/dashboard/products") {
    return (
      path.startsWith("/dashboard/products/") &&
      path !== "/dashboard/products/new"
    );
  }

  return href === "/dashboard/categories"
    ? path.startsWith("/dashboard/categories/") &&
        path !== "/dashboard/categories/new"
    : false;
};

const SideBar = () => {
  const path = usePathname();
  return (
    <>
      <nav
        aria-label="التنقل في لوحة التحكم"
        className="sticky top-7 z-40 bg-secondry px-4 py-3 md:hidden"
      >
        <h2 className="mb-2 text-lg text-primary">TOTY Dashboard</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              aria-current={isLinkActive(link.href, path) ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white transition-colors ${
                isLinkActive(link.href, path) ? "bg-primary" : "hover:bg-white/10"
              }`}
            >
              <link.icon aria-hidden="true" />
              {link.name}
            </Link>
          ))}
        </div>
      </nav>

      <aside className="fixed top-16 right-0 z-30 h-screen hidden w-64 bg-secondry px-3 pt-8 md:block">
        <h2 className="my-3 text-[25px] text-primary">TOTY Dashboard</h2>
        <nav aria-label="التنقل في لوحة التحكم">
          {Links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              aria-current={isLinkActive(link.href, path) ? "page" : undefined}
              className={`my-3 flex min-h-11 items-center gap-x-3 rounded-xl px-3 py-2 leading-6 text-white transition-colors ${
                isLinkActive(link.href, path) ? "bg-primary" : "hover:bg-white/10"
              }`}
            >
              <link.icon aria-hidden="true" />
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default SideBar;
