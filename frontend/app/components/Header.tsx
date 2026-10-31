"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { HiBars3BottomLeft } from "react-icons/hi2";
import { IoIosSearch } from "react-icons/io";

interface ILinks {
  name: string;
  href: string;
}

interface ISearchProduct {
  id: number;
  name: string;
  title: string;
  price: number | string;
  images: Array<{ id: number; imageurl: string }>;
}

interface ISearchResponse {
  data?: {
    products?: ISearchProduct[];
  };
}

const API_URL = "http://localhost:4000/api";
const API_ORIGIN = "http://localhost:4000";

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) {
    return "/assests/hero.jpg";
  }
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }
  return `${API_ORIGIN}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

const SearchForm = ({ inputId }: { inputId: string }) => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ISearchProduct[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const trimmedQuery = query.trim();
  const showSuggestions = isFocused && trimmedQuery.length >= 2;

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");
      try {
        const searchParams = new URLSearchParams({
          page: "1",
          limit: "5",
          search: trimmedQuery.slice(0, 100),
        });
        const response = await fetch(
          `${API_URL}/products?${searchParams.toString()}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`تعذر البحث عن المنتجات (HTTP ${response.status}).`);
        }

        const result = (await response.json()) as ISearchResponse;
        if (!Array.isArray(result.data?.products)) {
          throw new Error("استجابة البحث عن المنتجات غير صالحة.");
        }
        setProducts(result.data.products);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Navbar product search failed:", requestError);
        setProducts([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "تعذر البحث عن المنتجات الآن.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [trimmedQuery]);

  return (
    <div className="relative w-full">
      <form
        action="/products"
        method="get"
        role="search"
        className="flex items-center gap-2 rounded-full border border-gray-300 px-3"
      >
        <label htmlFor={inputId} className="sr-only">
          ابحثي عن منتج
        </label>
        <input
          id={inputId}
          className="w-full bg-transparent py-1.5 font-cairo text-sm outline-none placeholder:text-gray-500"
          type="search"
          name="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setProducts([]);
            setIsLoading(false);
            setError("");
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setIsFocused(false), 120);
          }}
          placeholder="ابحثي عن منتج"
          autoComplete="off"
        />
        <button
          type="submit"
          aria-label="بحث"
          className="shrink-0 text-secondry transition hover:text-primary"
        >
          <IoIosSearch aria-hidden="true" className="text-[26px]" />
        </button>
      </form>

      {showSuggestions && (
        <div
          id={`${inputId}-suggestions`}
          className="absolute inset-x-0 top-full z-[70] mt-2 max-h-[min(70vh,28rem)] overflow-y-auto border border-gray-200 bg-white text-right shadow-xl"
        >
          {isLoading ? (
            <p
              role="status"
              className="px-4 py-5 font-cairo text-sm text-gray-500"
            >
              جارٍ البحث عن المنتجات...
            </p>
          ) : error ? (
            <p role="alert" className="px-4 py-5 font-cairo text-sm text-red-700">
              {error}
            </p>
          ) : products.length > 0 ? (
            <>
              <ul aria-label="منتجات مطابقة للبحث">
                {products.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.id}`}
                      onClick={() => setIsFocused(false)}
                      className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 transition hover:bg-neutral"
                    >
                      <Image
                        src={getImageUrl(product.images?.[0]?.imageurl)}
                        alt=""
                        width={48}
                        height={60}
                        unoptimized
                        className="h-[60px] w-12 shrink-0 object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-cairo text-sm font-semibold text-secondry">
                          {product.name}
                        </span>
                        <span className="mt-1 block truncate font-cairo text-xs text-gray-500">
                          {product.title} ·{" "}
                          {Number(product.price).toLocaleString("ar-EG")} ج.م
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/products?search=${encodeURIComponent(trimmedQuery.slice(0, 100))}`}
                onClick={() => setIsFocused(false)}
                className="block px-4 py-3 text-center font-cairo text-sm font-semibold text-primary transition hover:bg-neutral"
              >
                عرض كل نتائج البحث
              </Link>
            </>
          ) : (
            <p className="px-4 py-5 font-cairo text-sm text-gray-500">
              لا توجد منتجات مطابقة لبحثك.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const Links: ILinks[] = [
  {
    name: "عننا",
    href: "/about",
  },
  {
    name: "الكوليكشن",
    href: "/products",
  },
  {
    name: "تواصل معانا",
    href: "/contact",
  },
];
const getCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

const Header = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const updateAuthState = () => {
      setIsAuthenticated(Boolean(getCookie("token")));
      setIsAdmin(getCookie("role") === "admin");
    };

    updateAuthState();
    window.addEventListener("focus", updateAuthState);
    return () => window.removeEventListener("focus", updateAuthState);
  }, [pathname]);

  const handleLogout = () => {
    deleteCookie("token");
    deleteCookie("role");
    setIsAuthenticated(false);
    setIsAdmin(false);
    router.push("/");
  };

  const navigationLinks = isAdmin
    ? [...Links, { name: "لوحة التحكم", href: "/dashboard/users" }]
    : Links;

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white fixed top-0 left-0 right-0 w-full z-50 transition-all">
      {/* Desktop Menu */}
      <div className="logo">
        <Link href="/" className="text-primary text-xl font-alex">
          توتي فاشون
        </Link>
      </div>
      <div className="hidden sm:flex items-center gap-8">
        {navigationLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.name}
          </Link>
        ))}

        <div className="hidden lg:block">
          <SearchForm inputId="navbar-product-search-desktop" />
        </div>

        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="cursor-pointer px-8 py-2 bg-secondry hover:bg-black transition text-white rounded-full"
          >
            تسجيل الخروج
          </button>
        ) : (
          <Link
            href={"/login"}
            className="cursor-pointer px-8 py-2 bg-secondry hover:bg-black transition text-white rounded-full"
          >
            تسجيل الدخول
          </Link>
        )}
      </div>

      <button
        onClick={() => (open ? setOpen(false) : setOpen(true))}
        aria-label="Menu"
        className="sm:hidden"
      >
        {/* Menu Icon SVG */}
        <HiBars3BottomLeft />
      </button>

      {/* Mobile Menu */}
      <div
        className={`${open ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_0_100%_0)]"} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-center h-screen  gap-2 px-5 text-sm md:hidden transition-all duration-500`}
      >
        {navigationLinks.map((link) => (
          <Link
            href={link.href}
            key={link.href}
            onClick={() => setOpen(false)}
            className=" block text-center text-2xl my-5"
          >
            {link.name}
          </Link>
        ))}

        <div className="my-5">
          <SearchForm inputId="navbar-product-search-mobile" />
        </div>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer px-8 py-2 bg-secondry hover:bg-black transition text-white rounded-full w-full block text-center mx-auto"
          >
            تسجيل الخروج
          </button>
        ) : (
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="cursor-pointer px-8 py-2 bg-secondry hover:bg-black transition text-white rounded-full w-full block text-center mx-auto"
          >
            تسجيل الدخول
          </Link>
        )}
      </div>
    </nav>
  );
};
export default Header;
