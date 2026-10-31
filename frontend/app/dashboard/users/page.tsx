import React from "react";
import { cookies } from "next/headers";
import type { IconType } from "react-icons";
import { FaRegEye } from "react-icons/fa";
import { FaRegPenToSquare, FaUsers, FaUserShield } from "react-icons/fa6";
import { LuUsers } from "react-icons/lu";
import Link from "next/link";
import Image from "next/image";

import DeleteRow from "../components/DeleteRow";
import api from "@/lib/api";
// ===================== MetaData ================
export const metadata = {
  title: "إدارة المستخدمين | لوحة التحكم  ",
  description: "إدارة المستخدمين والعميلات في لوحة التحكم الخاصة بك.",
  keywords: "إدارة المستخدمين, لوحة التحكم, المستخدمين, العملاء, الإحصائيات",
  openGraph: {
    title: "إدارة المستخدمين | لوحة التحكم",
    description: "إدارة المستخدمين والعميلات في لوحة التحكم الخاصة بك.",
    url: "/dashboard/users",
    siteName: "لوحة التحكم",
    images: [
      {
        url: "/images/dashboard-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "إدارة المستخدمين | لوحة التحكم",
      },
    ],
    locale: "ar_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "إدارة المستخدمين | لوحة التحكم",
    description: "إدارة المستخدمين والعميلات في لوحة التحكم الخاصة بك.",
    images: ["/images/dashboard-og-image.jpg"],
  },
};

// ==================== Types ====================

interface IRoleData {
  title: string;
  role: string;
  count: number;
  icons: IconType;
}

interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  address: string;
  phone: string;
  image: string | null;
  created_At: string;
  updated_At: string;
}

interface IRoleCount {
  role: string;
  count: number;
}

interface IUsersResponse {
  ok: boolean;
  data: {
    users: IUser[];
    pagination: {
      page: number;
      limit: number;
      totalUsers: number;
      totalPages: number;
    };
  };
}

interface IRolesResponse {
  ok: boolean;
  data: {
    roleData: IRoleCount[];
  };
}

interface IProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

// ==================== Constants ====================

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 4,
  totalUsers: 0,
  totalPages: 0,
};

// ==================== Page ====================

const UsersPage = async ({
  searchParams,
}: IProps): Promise<React.JSX.Element> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const params = await searchParams;

  const parsedPage = Number(params.page);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  let roles: IRoleData[] = [];
  let users: IUser[] = [];
  let pagination = DEFAULT_PAGINATION;

  // ==================== Fetch Data ====================

  if (token) {
    try {
      const [rolesResponse, usersResponse] = await Promise.all([
        api.get<IRolesResponse>("/users/group-by-role", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        api.get<IUsersResponse>(`/users?page=${page}&limit=5`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const rolesData = rolesResponse.data;
      const usersData = usersResponse.data;

      // ==================== Role Counts ====================

      const roleData = rolesData.data.roleData ?? [];

      const adminCount =
        roleData.find((item) => item.role === "admin")?.count ?? 0;

      const userCount =
        roleData.find((item) => item.role === "user")?.count ?? 0;

      roles = [
        {
          title: "إجمالي المستخدمين",
          role: "all",
          count: adminCount + userCount,
          icons: FaUsers,
        },
        {
          title: "عدد المسؤولين",
          role: "admin",
          count: adminCount,
          icons: FaUserShield,
        },
        {
          title: "عدد العملاء",
          role: "user",
          count: userCount,
          icons: LuUsers,
        },
      ];

      // ==================== Users & Pagination ====================

      users = usersData.data.users ?? [];
      pagination = usersData.data.pagination ?? DEFAULT_PAGINATION;
    } catch (error) {
      console.error("Users dashboard error:", error);
    }
  }

  // ==================== Render ====================

  return (
    <div className="w-full min-w-0">
      {/* Header */}
      <header>
        <h2 className="my-3 text-2xl text-primary sm:text-[30px]">
          إدارة المستخدمين والعميلات
        </h2>

        <p className="my-2 w-full max-w-4xl font-cairo text-base leading-7 sm:text-[17px]">
          إشراف كوتور متكامل على ملفات العميلات الحصريات، سجلات الشراء الرفيعة،
          تخصيص درجات النخبة وتعيين الصلاحيات الإدارية.
        </p>
      </header>

      {/* Statistics Cards */}
      <section
        aria-label="إحصائيات المستخدمين"
        className="my-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {roles.map((role) => {
          const Icon = role.icons;

          return (
            <div
              key={role.role}
              className="bg-secondry flex justify-between items-start p-5 rounded-xl text-white hover:-translate-y-1 transition-all duration-300 ease-in"
            >
              <div>
                <h3 className="font-bold text-[18px]">{role.title}</h3>

                <p className="text-[16px] mt-2">{role.count} مستخدم</p>
              </div>

              <Icon className="text-[24px]" />
            </div>
          );
        })}
      </section>

      {/* Users Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[900px] border-separate border-spacing-y-2 text-right">
          <thead>
            <tr className="bg-white text-secondry">
              <th className="p-3 font-alex">#</th>
              <th className="p-3 font-alex">الملف التفصيلي</th>
              <th className="p-3 font-alex">الدور</th>
              <th className="p-3 font-alex">العنوان</th>
              <th className="p-3 font-alex">رقم الهاتف</th>
              <th className="p-3 font-alex">تاريخ الإنشاء</th>
              <th className="p-3 font-alex">تاريخ التحديث</th>
              <th className="p-3 font-alex">إجراءات الأدمن</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className="bg-white text-secondry hover:bg-gray-100 rounded-md transition-all duration-300 ease-in"
                >
                  <td className="p-3">
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </td>

                  <td className="p-3 flex items-center gap-x-2">
                    {user.image ? (
                      <Image
                        src={`http://localhost:4000/images/${user.image}`}
                        alt={`صورة ${user.name}`}
                        width={40}
                        height={40}
                        unoptimized
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        {user.name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    )}
                    <div>
                      <h3 className="font-bold">{user.name}</h3>
                      <p className="text-[14px]">{user.email}</p>
                    </div>
                  </td>

                  <td className="p-3">
                    {user.role === "admin" ? "مدير" : "مستخدم"}
                  </td>

                  <td className="p-3">{user.address || "—"}</td>

                  <td className="p-3">{user.phone || "—"}</td>

                  <td className="p-3">
                    {user.created_At
                      ? new Date(user.created_At).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="p-3">
                    {user.updated_At
                      ? new Date(user.updated_At).toLocaleDateString()
                      : "/"}
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2 justify-center items-center">
                      <Link
                        href={`/dashboard/users/${user.id}`}
                        aria-label={`عرض ${user.name}`}
                        className="px-2 py-1"
                      >
                        <FaRegEye className="text-[20px] text-secondry hover:text-primary transition-all duration-300" />
                      </Link>

                      <Link
                        href={`/dashboard/users/update/${user.id}`}
                        aria-label={`تعديل ${user.name}`}
                        className="px-2 py-1"
                      >
                        <FaRegPenToSquare className="text-[20px] text-secondry hover:text-primary transition-all duration-300" />
                      </Link>

                      <DeleteRow
                        endpoint={`users/${user.id}`}
                        token={token ?? ""}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="bg-white text-secondry">
                <td colSpan={8} className="p-6 text-center">
                  لا يوجد مستخدمون لعرضهم
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <nav
          aria-label="صفحات المستخدمين"
          className="flex justify-center items-center gap-3 my-5"
        >
          {Array.from(
            { length: pagination.totalPages },
            (_, index) => index + 1,
          ).map((pageNumber) => (
            <Link
              key={pageNumber}
              scroll={false}
              href={`/dashboard/users?page=${pageNumber}`}
              aria-current={pageNumber === pagination.page ? "page" : undefined}
              className={`px-3 py-1 rounded-md transition-all ${
                pageNumber === pagination.page
                  ? "bg-primary text-white"
                  : "bg-white text-secondry hover:bg-gray-100"
              }`}
            >
              {pageNumber}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
};

export default UsersPage;
