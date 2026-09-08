"use client";
import Link from "next/link";
import Image from "next/image";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  FAMILY_NAMES,
  Product,
  SHOP_EVENT,
  displayPrice,
  money,
  productHref,
  productImage,
  readFavorites,
  toggleFavorite,
} from "@/lib/wink-shop";

export function ShopIcon({
  name,
}: {
  name: "bag" | "heart" | "search" | "menu" | "close" | "home" | "arrow";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "bag" ? (
        <>
          <path d="M5 8h14l1 13H4L5 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </>
      ) : name === "heart" ? (
        <path d="M20 5a5 5 0 0 0-7 0l-1 1-1-1a5 5 0 0 0-7 7l8 8 8-8a5 5 0 0 0 0-7Z" />
      ) : name === "search" ? (
        <>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </>
      ) : name === "menu" ? (
        <>
          <path d="M3 8h18M3 16h18" />
        </>
      ) : name === "close" ? (
        <path d="m5 5 14 14M5 19 19 5" />
      ) : name === "arrow" ? (
        <path d="M4 12h16m-6-6 6 6-6 6" />
      ) : (
        <>
          <path d="m3 11 9-8 9 8M5 10v11h14V10" />
          <path d="M9 21v-7h6v7" />
        </>
      )}
    </svg>
  );
}

export function FavoriteButton({ slug }: { slug: string }) {
  const [selected, setSelected] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const sync = () => setSelected(readFavorites().includes(slug));
    sync();
    window.addEventListener(SHOP_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SHOP_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [slug]);
  return (
    <>
      <button
        type="button"
        className={`wk-favorite ${selected ? "selected" : ""}`}
        aria-label={selected ? "Убрать из избранного" : "Добавить в избранное"}
        aria-pressed={selected}
        onClick={() => {
          try {
            setSelected(toggleFavorite(slug).includes(slug));
            setError("");
          } catch {
            setError("Не удалось сохранить избранное.");
          }
        }}
      >
        <ShopIcon name="heart" />
      </button>
      {error && (
        <span className="wk-save-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
}

export function ProductCard({
  product,
  palette,
  note,
}: {
  product: Product;
  palette?: string;
  note?: string;
}) {
  const [preview, setPreview] = useState(false);
  return (
    <article className="wk-product-card">
      <div className="wk-product-visual">
        <Link
          href={productHref(product.slug, palette)}
          aria-label={`${product.subtitle}, ${money(displayPrice(product, palette))}`}
        >
          <Image
            src={productImage(product)}
            alt={`Визуальное настроение коллекции ${FAMILY_NAMES[product.name] || product.name}`}
            width={768}
            height={960}
            sizes="(max-width: 700px) 50vw, 25vw"
            unoptimized
          />
        </Link>
        <FavoriteButton slug={product.slug} />
        <button
          type="button"
          className="wk-quickview-trigger"
          onClick={() => setPreview(true)}
          aria-label={`Быстрый просмотр: ${FAMILY_NAMES[product.name]}, ${product.subtitle}`}
        >
          Быстрый просмотр ↗
        </button>
        {note && <span className="wk-card-note">{note}</span>}
      </div>
      <div className="wk-product-copy">
        <span className="wk-eyebrow">
          {FAMILY_NAMES[product.name] || product.name}
        </span>
        <Link href={productHref(product.slug, palette)}>
          <h3>{product.subtitle}</h3>
        </Link>
        <div>
          <strong>{money(displayPrice(product, palette))}</strong>
          <Link
            href={productHref(product.slug, palette)}
            aria-label={`Выбрать ${product.subtitle}`}
          >
            <ShopIcon name="arrow" />
          </Link>
        </div>
      </div>
      {preview && (
        <ShopDialog
          open={preview}
          onClose={() => setPreview(false)}
          title="Знакомьтесь, ваш WINK"
        >
          <div className="wk-quickview">
            <Image
              src={productImage(product)}
              alt={`Визуализация коллекции ${FAMILY_NAMES[product.name]}`}
              width={600}
              height={750}
              unoptimized
            />
            <div>
              <p className="wk-eyebrow">{product.name}</p>
              <h2>{FAMILY_NAMES[product.name]}</h2>
              <p>{product.description}</p>
              <strong>{money(displayPrice(product, palette))}</strong>
              <p>
                Палитра, персонализация и дополнения — на следующем шаге.
                Доставка оплачивается отдельно.
              </p>
              <Link
                href={productHref(product.slug, palette)}
                className="wk-button"
              >
                Выбрать детали <ShopIcon name="arrow" />
              </Link>
              <p className="wk-image-note">
                Изображение передаёт настроение, не точный состав набора.
              </p>
            </div>
          </div>
        </ShopDialog>
      )}
    </article>
  );
}

let openDialogs = 0;
let previousOverflow = "";
export function ShopDialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      if (openDialogs === 0) previousOverflow = document.body.style.overflow;
      openDialogs++;
      document.body.style.overflow = "hidden";
      return () => {
        dialog.close();
        openDialogs = Math.max(0, openDialogs - 1);
        if (openDialogs === 0) document.body.style.overflow = previousOverflow;
      };
    }
    dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="wk-dialog"
      aria-label={title}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="wk-dialog-inner">
        <header>
          <strong>{title}</strong>
          <button
            className="wk-icon-button"
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <ShopIcon name="close" />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
